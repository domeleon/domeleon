import { isRouted, type IRouteService } from './routerTypes.js'
import { Route } from './route.js'
import { HistorySync, type Action } from './history.js'
import type { App } from '../app/app.js'
import type { Router } from './router.js'

export interface RouteServiceOptions {
  basePath?: string
}

export class RouteService implements IRouteService {
  private _basePath: Route  
  private _history?: HistorySync
  private _root!: Router
  currentRoute: Route = new Route("")

  get basePath(): Route { return this._basePath }
  get root(): Router { return this._root }

  constructor(options: RouteServiceOptions = {}) {
    this._basePath = new Route (options.basePath ?? "")
  }

  syncHistory(action: Action): void {
    this._history?.sync(action)
  }

  init(app: App): void {
    const root = app.rootComponent
    if (!isRouted(root)) return
    
    root.router.routeService = this
    this._root = root.router
    this._history = new HistorySync(this)
    this._history.ensureListener()
    const loc = window.location
    root.router.navigate(new Route(loc.pathname + loc.search), 'POP')
  }
}
