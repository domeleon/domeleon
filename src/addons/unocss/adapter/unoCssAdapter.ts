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
  #id: string
  #generatorPromise: Promise<UnoGenerator>
  #styleEl?: HTMLStyleElement
  #stickyClasses = new Set<string>()
  #stickyMode: StickyMode
  #shortcuts: Shortcuts
  #isolateSelectors: boolean

  constructor(options: UnoCssAdapterOptions) {
    const { id, stickyMode = "always", isolateSelectors = false, unoCssConfig = {} } = options
    this.#id = id
    this.#shortcuts = new Shortcuts(this.#id)
    this.#stickyMode = stickyMode
    this.#isolateSelectors = isolateSelectors
    const merged: UserConfig = {
      ...unoCssConfig,
      variants: [
        ...(unoCssConfig.variants || []),
        globalVariant,
      ],
    }
    this.#generatorPromise = createGenerator(merged)
  }

  /** Sticky-class generation mode. */
  get stickyMode() { return this.#stickyMode }

  async generate(classes: Set<string>, stickyClasses: Set<string>) {
    const generator = await this.#generatorPromise

    this.#shortcuts.process(generator)

    stickyClasses.forEach((cls) => this.#stickyClasses.add(cls))
    if (this.#stickyMode === "always") {
      classes.forEach((cls) => this.#stickyClasses.add(cls))
    }

    const tokensToGenerate =
      this.#stickyMode === "always"
        ? this.#stickyClasses
        : new Set([...this.#stickyClasses, ...classes])

    const generatorOptions = this.#isolateSelectors ? { scope: `#${this.#id}` } : undefined
    const { css } = await generator.generate(tokensToGenerate, generatorOptions)

    const styleId = `domeleon-uno-styles-${this.#id}`
    let el = this.#styleEl || (document.getElementById(styleId) as HTMLStyleElement | null)

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
    this.#styleEl = el
  }

  clearStickyClasses() {
    this.#stickyClasses.clear()
  }

  shortcut<T extends Record<string, string>>(spec: ShortcutDef<T>) {
    return this.#shortcuts.add(spec)
  }
}