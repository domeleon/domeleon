import type { App } from './app.js'
import type { UpdateEvent } from '../component/componentTypes.js'

export interface AppPlugin<T = unknown> {
  create?(app: App): T
  onUpdated?(instance: T, event: UpdateEvent): void
  onRendered?(instance: T): void
}

export class AppPlugins {
  #pluginData: { plugin: AppPlugin; instance: unknown }[] = []
  #rendered = false

  constructor(private app: App, plugins: AppPlugin[] = []) {
    for (const plugin of plugins) {
      const instance = plugin.create?.(app)
      this.#pluginData.push({ plugin, instance })
    }
  }

  onRendered() {
    if (this.#rendered) return
    this.#rendered = true
    for (const { plugin, instance } of this.#pluginData) {
      plugin.onRendered?.(instance)
    }
  }

  /** Relay an UpdateEvent from the host App to each plugin. */
  onUpdated(event: UpdateEvent) {
    for (const { plugin, instance } of this.#pluginData) {
      plugin.onUpdated?.(instance, event)
    }
  }
} 