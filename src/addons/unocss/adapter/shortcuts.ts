import type { UnoGenerator } from '@unocss/core'
import { normalizeUtilityString } from '../../../index.js'

export type ShortcutDef<T extends Record<string,string>> = { prefix?: string; def: T }

/**
 * Manages UnoCSS shortcut definitions for an adapter.
 * Queues added shortcuts and flushes them into a generator right before CSS
 * generation so that callers do not need to deal with async timing.
 */
export class Shortcuts {
  /** Shortcuts awaiting registration on the UnoCSS generator */
  private _pending: Array<[string, string]> = []
  /** Already-registered aliases to avoid duplicates */
  private _registered = new Set<string>()

  constructor(private defaultPrefix = '') {}

  /**
   * Add one or many shortcut definitions at once.
   * Returns a map whose keys are identical to the supplied `defs` keys and the
   * values are the generated alias tokens to use in markup.
   */
  add<T extends Record<string, string>>(spec: ShortcutDef<T>): { [K in keyof T]: string } {
    const prefix = [this.defaultPrefix, spec.prefix]
      .filter(Boolean)
      .map(s => s!.replace(/^-+| -+$/g, ''))
      .join('-')

    return Object.fromEntries(
      Object.entries(spec.def).map(([key, body]) => {
        const alias = prefix ? `${prefix}-${key}` : key
        if (!this._registered.has(alias)) {
          this._registered.add(alias)
          this._pending.push([alias, body])
        }
        return [key, alias]
      }),
    ) as { [K in keyof T]: string }
  }

  /**
   * Flush any queued shortcuts into the given UnoCSS generator configuration.
   * Called by `UnoCssAdapter.generate()` right before generating CSS.
   */
  process(generator: UnoGenerator) {
    if (this._pending.length === 0) return

    // Uno's `config.shortcuts` is typed readonly; cast to mutable locally.
    ;(generator.config.shortcuts as any) ??= []
    const list = generator.config.shortcuts as any[]    
    list.push(
      ...this._pending.map(([alias, body]) => [
        alias,
        normalizeUtilityString(body.trim())
      ])
    )

    this._pending.length = 0
  }
}