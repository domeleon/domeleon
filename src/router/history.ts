import { Route } from "./route.js"
import type { IRouteService } from "./routerTypes.js"

export type Action = 'PUSH' | 'REPLACE' | 'POP'

const browserHistory = {
  push(route: Route) {
    window.history.pushState({}, '', route.toString())
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }))
  },
  replace(route: Route) {
    window.history.replaceState({}, '', route.toString())
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }))
  },
  back() {
    window.history.back()
  },
  listen(cb: (route: Route, action: Action) => void) {
    window.addEventListener('popstate', () => {
      cb(new Route(window.location.pathname + window.location.search), 'POP')
    })
  },
  get location(): Route {
    return new Route(window.location.pathname + window.location.search)
  }
}

export class HistorySync {
  private _registered = false
  constructor(private readonly service: IRouteService) {}

  ensureListener(): void {
    if (this.service.root.parent || this._registered) return
    this._registered = true
    browserHistory.listen((route: Route, act) => {
      if (act !== 'POP') return
      this.service.navigateAbsolute(route, 'POP')
    })
  }

  sync(action: Action): void {
    if (action === 'POP') return
    const fullRoute = this.service.basePath.concat(this.service.currentRoute)

    if (fullRoute.equals(browserHistory.location)) {
      browserHistory.replace(fullRoute)
    } else {
      browserHistory.push(fullRoute)
    }
  }
}