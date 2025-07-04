import { createGenerator, type UserConfig, type UnoGenerator } from '@unocss/core'
import { type CssAdapter } from '../../../index.js'
import { globalVariant } from './globalVariant.js'
import { Shortcuts, type ShortcutDef } from './shortcuts.js'

export type StickyMode = "always" | "explicit"

export interface UnoCssAdapterOptions {
  /** Unique identifier; also used for style-element IDs */
  id: string
  /** Configuration passed verbatim to UnoCSS */
  unoCssConfig?: UserConfig
  /** Sticky-class generation mode (default: "always"). */
  stickyMode?: StickyMode
  /** When true, generated selectors will be wrapped with `#${id}` to isolate them from the rest of the page. Defaults to false. */
  isolateSelectors?: boolean
}

export class UnoCssAdapter implements CssAdapter {
  private _id: string
  private _generatorPromise: Promise<UnoGenerator>
  private _styleEl?: HTMLStyleElement
  private _stickyClasses = new Set<string>()
  private _stickyMode: StickyMode
  private _shortcuts: Shortcuts
  private _isolateSelectors: boolean

  constructor(options: UnoCssAdapterOptions) {
    const { id, stickyMode = "always", isolateSelectors = false, unoCssConfig = {} } = options
    this._id = id
    this._shortcuts = new Shortcuts(this._id)
    this._stickyMode = stickyMode
    this._isolateSelectors = isolateSelectors
    const merged: UserConfig = {
      ...unoCssConfig,
      variants: [
        ...(unoCssConfig.variants || []),
        globalVariant,
      ],
    }
    this._generatorPromise = createGenerator(merged)
  }

  /** Sticky-class generation mode. */
  get stickyMode() { return this._stickyMode }

  async generate(classes: Set<string>, stickyClasses: Set<string>) {
    const generator = await this._generatorPromise

    this._shortcuts.process(generator)

    stickyClasses.forEach((cls) => this._stickyClasses.add(cls))
    if (this._stickyMode === "always") {
      classes.forEach((cls) => this._stickyClasses.add(cls))
    }

    const tokensToGenerate =
      this._stickyMode === "always"
        ? this._stickyClasses
        : new Set([...this._stickyClasses, ...classes])

    const generatorOptions = this._isolateSelectors ? { scope: `#${this._id}` } : undefined
    const { css } = await generator.generate(tokensToGenerate, generatorOptions)

    const styleId = `domeleon-uno-styles-${this._id}`
    let el = this._styleEl || (document.getElementById(styleId) as HTMLStyleElement | null)

    if (!el) {
      el = Object.assign(document.createElement('style'), {
        id: styleId,
        type: 'text/css',
      })
      document.head.append(el)
    }

    if (el.textContent !== css) {
      el.textContent = css
    }
    this._styleEl = el
  }

  clearStickyClasses() {
    this._stickyClasses.clear()
  }

  shortcut<T extends Record<string, string>>(spec: ShortcutDef<T>) {
    return this._shortcuts.add(spec)
  }
}