import { isRouted, type IRouteService } from './routerTypes.js'
import { Route } from './route.js'
import { HistorySync, type Action } from './history.js'
import type { App } from '../app/app.js'
import type { Router } from './router.js'

export interface RouteServiceOptions {
  basePath?: string
}

export class RouteService implements IRouteService {
  #basePath: Route  
  #history?: HistorySync
  #root!: Router
  currentRoute: Route = new Route("")

  get basePath(): Route { return this.#basePath }
  get root(): Router { return this.#root }

  constructor(options: RouteServiceOptions = {}) {
    this.#basePath = new Route (options.basePath ?? "")
  }

  syncHistory(action: Action): void {
    this.#history?.sync(action)
  }

  init(app: App): void {
    const root = app.rootComponent
    if (!isRouted(root)) return
    
    root.router.routeService = this
    this.#root = root.router
    this.#history = new HistorySync(this)
    this.#history.ensureListener()
    const loc = window.location
    root.router.navigate(new Route(loc.pathname + loc.search), 'POP')
  }
}
