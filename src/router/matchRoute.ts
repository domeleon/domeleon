import type { Router } from "./router.js"
import type { Action } from "./history.js"
import { Route } from "./route.js"
import { takeWhile } from "../util.js"

export interface MatchResult {
  cancel: boolean
  updates: Array<{ router: Router; segment: string }>
}

export async function matchRoute(
  router: Router,
  route: Route,
  action: Action,
  isStale: () => boolean
)
  : Promise<MatchResult>
{
  if (isStale()) return { cancel: true, updates: [] }

  const thisSeg = route.firstSegment
  const nextRoute = thisSeg ? route.remainder : route

  if ((await router.component.onNavigate(route, action)) === false || isStale()) {
    return { cancel: true, updates: [] }
  }

  const updates: MatchResult["updates"] = []

  if (thisSeg) {
    let relativeRoute = router.children.find(c => c.routeSegment === thisSeg)?.router
    if (!relativeRoute) return { cancel: true, updates: [] }

    for (const anc of contiguousTransparentParents(relativeRoute).reverse()) {
      if ((await anc.component.onNavigate(route, action)) === false || isStale()) {
        return { cancel: true, updates: [] }
      }
      updates.push({ router: anc, segment: thisSeg })
    }

    const childRes = await matchRoute(relativeRoute, nextRoute, action, isStale)
    if (childRes.cancel) return { cancel: true, updates: [] }
    updates.push(...childRes.updates)
  }

  if (isStale()) return { cancel: true, updates: [] }

  updates.push({ router, segment: thisSeg })
  return { cancel: false, updates }
}

const contiguousTransparentParents = (router: Router) =>
  takeWhile(router.rootToHereRouters.reverse().slice(1), anc => anc.isTransparent)