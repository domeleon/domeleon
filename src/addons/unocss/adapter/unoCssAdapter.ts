import { createGenerator, type UserConfig, type UnoGenerator } from '@unocss/core'
import { type CssAdapter } from '../../../index.js'
import { globalVariant } from './globalVariant.js'
import { Shortcuts, type ShortcutDef } from './shortcuts.js'

export type StickyMode = "always" | "explicit"

export class UnoCssAdapter implements CssAdapter {
  #generatorPromise: Promise<UnoGenerator>
  #styleEl?: HTMLStyleElement
  #stickyClasses = new Set<string>()
  stickyMode: StickyMode = "always"
  #shortcuts: Shortcuts

  /**
   * Optional scope selector used to prefix every generated rule, e.g. "#my-host".
   */
  public scope?: string

  constructor(private id: string, config: UserConfig = {}) {
    this.#shortcuts = new Shortcuts(this.id)
    const merged: UserConfig = {
      ...config,
      variants: [
        ...(config.variants || []),
        globalVariant,
      ],
    }
    this.#generatorPromise = createGenerator(merged)    
  }

  async generate(classes: Set<string>, stickyClasses: Set<string>) {
    const generator = await this.#generatorPromise

    this.#shortcuts.process(generator)

    stickyClasses.forEach((cls) => this.#stickyClasses.add(cls))
    if (this.stickyMode === "always") {
      classes.forEach((cls) => this.#stickyClasses.add(cls))
    }

    const tokensToGenerate =
      this.stickyMode === "always"
        ? this.#stickyClasses
        : new Set([...this.#stickyClasses, ...classes])

    const generatorOptions = this.scope ? { scope: this.scope } : undefined
    const { css } = await generator.generate(tokensToGenerate, generatorOptions)

    const id = `domeleon-uno-styles-${this.id}`
    let el = (this.#styleEl ||
      (document.getElementById(id) as HTMLStyleElement | null))

    if (!el) {
      el = Object.assign(document.createElement('style'), {
        id,
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

  shortcut<T extends Record<string, string>> (spec: ShortcutDef<T>) {
    return this.#shortcuts.add(spec)
  }
}