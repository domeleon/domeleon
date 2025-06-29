import type { ThemeSet, Theme, ThemeProxy } from './themingTypes.js'
import { CssVar } from './themingTypes.js'
import { ColorVar } from './color.js'
import type { UserConfig } from '@unocss/core'
import { UnoCssAdapter } from '../adapter/unoCssAdapter.js'
import { compileSafelist } from '../adapter/compileSafelist.js'
import { kebab } from '../../../index.js'

export interface UnoThemeManagerOptions<TTheme extends Theme> {
  id: string
  themes: ThemeSet<TTheme>
  initialTheme?: keyof ThemeSet<TTheme>
  rootSelector?: string
  unoCssConfig?: UserConfig
  globalUnoCss?: (theme: ThemeProxy<TTheme>) => Record<string, string>
  globalRawCss?: (theme: ThemeProxy<TTheme>) => string
}

export class UnoThemeManager<TTheme extends Theme> {
  public readonly unoCssAdapter: UnoCssAdapter
  #theme!: ThemeProxy<TTheme>  
  #unoStyleEl!: HTMLStyleElement
  #rawCssStyleEl!: HTMLStyleElement
  #globalRawCss?: (theme: ThemeProxy<TTheme>) => string
  #themeName!: string
  #id!: string 
  #themes!: ThemeSet<TTheme>
  #rootSelector!: string
  #prefix!: string
  #host!: HTMLElement

  constructor(options: UnoThemeManagerOptions<TTheme>) {
    this.#id = options.id
    this.#themes = options.themes
    this.#prefix = `--${this.#id}`
    this.#themeName = this.#getInitialTheme(options)
    this.#theme = this.#buildProxyTheme() 

    const resolvedUnoCfg: UserConfig = options.unoCssConfig || {}

    this.unoCssAdapter = new UnoCssAdapter(this.#id, {
      ...resolvedUnoCfg,
      theme: {
        ...(resolvedUnoCfg.theme || {}),
        ...this.#buildUnoTheme(),
      },
    })

    this.rootSelector = options.rootSelector || ':root'

    if (options.globalUnoCss) {
      const rawMap = options.globalUnoCss(this.theme)
      const tokens = compileSafelist(rawMap)
      this.unoCssAdapter.generate(new Set<string>(), new Set(tokens))
    }

    if (options.globalRawCss) {
      this.#globalRawCss = options.globalRawCss
      this.#renderRawCss()
    }
  }

  get theme(): ThemeProxy<TTheme> { return this.#theme }

  /** current root selector (e.g. ':root' or '#app') */
  get rootSelector() { return this.#rootSelector }

  set rootSelector(value: string) {
    if (!value || value === this.#rootSelector && this.#host) return

    this.#rootSelector = value
    this.#host = this.#createHostElement(this.#rootSelector)
    this.#renderUnoCss()
    this.#host.dataset.theme = this.#themeName
    this.unoCssAdapter.scope = this.#rootSelector !== ':root' ? this.#rootSelector : undefined
  }

  set themeName(name: string) {
    this.#themeName = name
    this.#theme = this.#buildProxyTheme() // rebuild as some people still want to access theme's raw values
    this.#renderUnoCss()
    const el = this.#host
    el.dataset.theme = name
    el.classList.remove('theme-transitions-active')
    requestAnimationFrame(() => el.classList.add('theme-transitions-active'))  

    this.#renderRawCss()
  }

  get themeName() {
    return this.#themeName
  }

  #getInitialTheme (options: UnoThemeManagerOptions<TTheme>) {
    const firstTheme = Object.keys(options.themes)[0]
    const chosenTheme = options.initialTheme    
    if (chosenTheme) {
      if (options.themes[chosenTheme]) return chosenTheme  
      console.warn(`Initial theme "${chosenTheme}" not found—falling back to "${firstTheme}".`)
    }
    return firstTheme
  }

  #createHostElement (rootSelector: string) {        
    const host = rootSelector && rootSelector !== ':root'
        ? (document.querySelector(rootSelector) as HTMLElement | null)
        : document.documentElement
      return host ?? document.documentElement
  }

  #buildProxyTheme = (): ThemeProxy<TTheme> =>
    walk(this.#themes[this.#themeName], [], this.#proxyLeaf) as ThemeProxy<TTheme>

  #buildUnoTheme = () =>
    walk(this.#themes[this.#themeName], [], this.#unoLeaf)

  #proxyLeaf = (path: string[], val: any) =>
    path[0] === 'colors'
      ? new ColorVar(path.slice(1).join('-'), String(val), this.#cssVar(path))
      : new CssVar(path.slice(1).join('-'), String(val), this.#cssVar(path))

  #unoLeaf = (path: string[], val: any) =>
    path[0] === 'colors'
      ? new ColorVar(path.at(-1)!, String(val), this.#cssVar(path)).css
      : `var(${this.#cssVar(path)})`

  #cssVar = (segments: string[]) =>
    `${this.#prefix}-${segments.map(kebab).join('-')}`

  #cssVars = (theme: TTheme) =>
    flatten(theme)
      .map(([path, val]) => {
        const name = this.#cssVar(path)
        const raw =
          path[0] === 'colors'
            ? new ColorVar(path.at(-1)!, String(val), name).format()
            : String(val)
        return `  ${name}: ${raw};`
      })
      .join('\n')

  #renderUnoCss() {
    this.#unoStyleEl = this.#ensureSheet(`domeleon-uno-theme-${this.#id}`)
    this.#unoStyleEl.textContent = Object.entries(this.#themes)
      .map(
        ([n, v]) =>
          `${this.#rootSelector}[data-theme=\"${n}\"] {\n${this.#cssVars(v)}\n}`
      )
      .join('\n')
  }

  #renderRawCss() {
    this.#rawCssStyleEl = this.#ensureSheet(`domeleon-css-theme-${this.#id}`)    
    if (this.#globalRawCss) {
      this.#rawCssStyleEl.textContent = this.#globalRawCss(this.#theme)
    }
  }

  #ensureSheet(id: string): HTMLStyleElement {
    const el = (document.getElementById(id) as HTMLStyleElement) ??
      Object.assign(document.createElement('style'), { id, type: 'text/css' })
    if (!document.head.contains(el)) document.head.append(el)
    return el
  }

  /**
   * Creates a set of css styles, optionally prefixed. Internally translates
   * to `unoCssAdapter.shortcut`.
   *
   * Example:
   * ```ts
   * const styles = themeMgr.styles("todo", theme => ({
   *   item: `text-${theme.colors.textPrimary}`,
   *   done: `text-${theme.colors.textSecondary} line-through`,
   * }))
   * ```
   */
  styles<Defs extends Record<string, string>>(
    prefixOrFactory: string | ((theme: ThemeProxy<TTheme>) => Defs),
    factory?: (theme: ThemeProxy<TTheme>) => Defs,
  )
    : { [K in keyof Defs]: string }
  {
    const hasPrefix = typeof prefixOrFactory === 'string'
    const prefix = hasPrefix ? prefixOrFactory : undefined
    const f = hasPrefix ? factory : prefixOrFactory
    return this.unoCssAdapter.shortcut( { prefix, def: f!(this.theme) })
  }
}

const walk = (
  obj: Record<string, any>,
  prefix: string[],
  leaf: (path: string[], val: any) => any
): any =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) =>
      v && typeof v === 'object'
        ? [k, walk(v, [...prefix, k], leaf)]
        : [k, leaf([...prefix, k], v)]
    )
  )

const flatten = (
  obj: Record<string, any>,
  prefix: string[] = []
): Array<[string[], any]> =>
  Object.entries(obj).flatMap(([k, v]) => {
    const p = [...prefix, k]
    return v && typeof v === 'object' ? flatten(v, p) : [[p, v]]
  })  