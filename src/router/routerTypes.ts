import type { Component } from '../component/component.js'
import type { UpdateEvent } from '../component/componentTypes.js'
import type { Route } from './route.js'
import { Router } from './router.js'
import type { Action } from './history.js'

export interface IRouted extends Component {
  router: Router
  routeSegment: string
}

export function isRouted(c: Component | IRouted): c is IRouted {
  return (
    typeof c === 'object' &&
    c !== null &&
    'router' in c &&
    c.router instanceof Router
  )
}

export interface IRouteService {
  basePath: Route  
  currentRoute: Route
  root: Router  
  syncHistory(action: Action): void
  navigateAbsolute(absolute: Route, action: Action): Promise<boolean>
}

export interface RouterEvent extends UpdateEvent {
  cause: "router"
}