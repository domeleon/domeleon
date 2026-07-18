import type { App } from './app.js'

/** Shape of the `window.domeleon` global handle, for devtools and page scripts. */
export interface DomeleonGlobal {
  /** Live apps keyed by mount element `id`; re-mounting on the same id replaces the entry. */
  apps: Map<string, App>
}

/**
 * Registers an app under the framework-owned `window.domeleon` handle,
 * and attaches it to its mount element as `__domeleon_app__`.
 */
export function registerApp(app: App, id: string, element: Element | null) {
  if (typeof window === 'undefined') return
  const w = window as any
  const global: DomeleonGlobal = w.domeleon ??= { apps: new Map() }
  global.apps.set(id, app)
  if (element)
    (element as any).__domeleon_app__ = app
}
