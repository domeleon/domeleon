import { Component } from "../component/component.js"
import type { Action } from "./history.js"
import type { IRouted, IRouteService } from "./routerTypes.js"
import { isRouted } from "./routerTypes.js"
import { a } from "../dom/htmlGenElements.js"
import type { HValues } from "../dom/html.js"
import { matchRoute } from "./matchRoute.js"
import { Route } from "./route.js"
import type { RouterEvent } from "./routerTypes.js"
import type { VElement } from "../dom/dom.js"

export class Router {
  readonly #component: IRouted
  #activeSegment = ""
  #navigationVersion = 0
  #inFlight?: { route: Route; promise: Promise<boolean> }
  routeService?: IRouteService  
  
  constructor(owner: Component & IRouted) {
    this.#component = owner
  }  

  navigate(relativeRoute: Route | string | string[], action: Action = "PUSH"): Promise<boolean>
  {
    const relRoute = relativeRoute instanceof Route ? relativeRoute : new Route(relativeRoute)
  
    const root = this.root
    const prevActive = root.activeLeaf!.rootToHereRouters
    const isStale = this.#bumpNavigationVersion()
  
    const pathOnly = relRoute.pathOnly
    const relQuery = relRoute.query

    const absolute = this.rootToHereRoute.concat(pathOnly)
    const target = absolute.withQuery(relQuery)

    const existing = this.#getInFlight(target)
    if (existing) return existing
    if (this.#shouldShortCircuit(target, action)) return Promise.resolve(true)

    const job = (async (): Promise<boolean> => {
      const result = await matchRoute (this.root, target, action, isStale)
      if (result.cancel) return false

      for (const { router, segment } of result.updates) {
        router.#activeSegment = segment
      }

      this.root.routeService!.currentRoute = target      
      this.root.routeService?.syncHistory(action)
      this.#clearActiveSegments(prevActive)
      this.#fireRouterUpdateEvent()
      this.#fireNavigated()
      return true
    })()

    root.#inFlight = { route: target, promise: job }
    job.finally(() => {
      if (root.#inFlight?.promise === job) root.#inFlight = undefined
    })

    return job
  }

  get component() { return this.#component }

  #fireRouterUpdateEvent (): void {
    const cur = this.root.routeService?.currentRoute
    if (cur) {
      this.component.update(<RouterEvent>{
        cause: "router", key: "route", value: cur.toString()
      })
    }
  }

  #bumpNavigationVersion(): () => boolean {
    this.root.#navigationVersion++
    const token = this.root.#navigationVersion
    return () => token !== this.root.#navigationVersion
  }

  #getInFlight(target: Route): Promise<boolean> | undefined {
    return this.root.#inFlight?.route.equals(target)
      ? this.root.#inFlight.promise
      : undefined
  }

  #shouldShortCircuit(target: Route, action: Action): boolean {
    const cur = this.root.routeService?.currentRoute
    return action !== "POP" && cur ? target.equals(cur) : false
  }

  #fireNavigated(): void {
    this.root.activeLeaf!.rootToHereRouters.forEach(r => r.component.onNavigated())
  }

  #clearActiveSegments(prevActive: Router[]): void {
    const newActive = this.root.activeLeaf!.rootToHereRouters
    prevActive
      .filter(r => !newActive.includes(r))
      .forEach(r => r.#activeSegment = "")
  }

  get activeSegment(): string {
    return this.#activeSegment
  }

  get activeLeaf(): Router | undefined {
    if (!this.isActive) return undefined
    return this.activeChild?.router.activeLeaf ?? this
  }

  get isActive(): boolean {
    return ! this.parent ? true : this.parent.activeChild?.router === this
  }

  get parent(): Router | undefined {
    let c = this.component.ctx.parent
    while (c && !isRouted(c)) { c = c.ctx.parent }
    return c ? c.router : undefined
  }

  get rootToHereRouters(): Router[] {
    const list: Router[] = []
    for (let r: Router | undefined = this; r; r = r.parent) {
      list.unshift(r)
    }
    return list
  }

  get rootToHereRoute(): Route {
    const segments = this.rootToHereRouters
      .filter(r => !r.isTransparent)
      .map(r => r.component.routeSegment)
    return new Route (segments)
  }

  get root(): Router {
    return this.parent ? this.parent.root : this
  }

  get children(): IRouted[] {
    return this.component.ctx.children.flatMap(c =>
      isRouted(c)
        ? c.router.isTransparent
          ? c.router.children
          : [c]
        : []
    )
  }

  child(seg: string): IRouted | undefined {
    return this.children.find(c => c.routeSegment === seg)
  }

  get activeChild(): IRouted | undefined {
    return this.child(this.activeSegment)
  }

  get isTransparent(): boolean {    
    return this.component.routeSegment === ""
  }

  link (relativeRoute: Route | string | string[], ...content: HValues[]) : VElement {
    const relRoute = relativeRoute instanceof Route ? relativeRoute : new Route(relativeRoute)
    const href = this.root.routeService?.basePath!.concat(this.rootToHereRoute).concat(relRoute).toString()
    return a({
      href,
      onClick: e => {
        e.preventDefault()
        this.navigate(relRoute)
      }
    },
      ...content
    )
  }
}