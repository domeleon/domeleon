import { kebab } from 'domeleon'
import type { ThemeSet, Theme, ThemeProxy } from './themingTypes.js'
import { CssVar } from './themingTypes.js'
import { ColorVar } from './color.js'
import type { UserConfig } from '@unocss/core'
import { UnoCssAdapter } from '../adapter/unoCssAdapter.js'
import { compileSafelist } from '../adapter/compileSafelist.js'

export interface UnoThemeManagerOptions<TTheme extends Theme> {
  id: string
  themes: ThemeSet<TTheme>
  initialTheme?: keyof ThemeSet<TTheme>
  unoCssConfig?: UserConfig
  globalUnoCss?: (theme: ThemeProxy<TTheme>) => Record<string, string>
  globalRawCss?: (theme: ThemeProxy<TTheme>) => string
  /**
   * When true, all theme output is isolated to the element with `id` (CSS variables
   * live on `#id` and generated selectors are wrapped with `#id`).
   * When false (default), variables go to `:root` and selectors are global.
   */
  isolate?: boolean
}

export class UnoThemeManager<TTheme extends Theme> {
  public readonly unoCssAdapter: UnoCssAdapter
  private _theme!: ThemeProxy<TTheme>  
  private _unoStyleEl!: HTMLStyleElement
  private _rawCssStyleEl!: HTMLStyleElement
  private _globalRawCss?: (theme: ThemeProxy<TTheme>) => string
  private _themeName!: string
  private _id!: string 
  private _themes!: ThemeSet<TTheme>
  private _host!: HTMLElement
  private _isolate!: boolean

  constructor(options: UnoThemeManagerOptions<TTheme>) {
    this._id = options.id
    this._isolate = options.isolate ?? false
    this._themes = options.themes
    this._themeName = this.getInitialTheme(options)
    this._theme = this.buildProxyTheme() 
    const resolvedUnoCfg: UserConfig = options.unoCssConfig || {}    

    this.unoCssAdapter = new UnoCssAdapter({
      id: this._id,
      isolateSelectors: this._isolate,
      unoCssConfig: {
        ...resolvedUnoCfg,
        theme: {
          ...(resolvedUnoCfg.theme || {}),
          ...this.buildUnoTheme(),
        },
      }
    })

    this._host = this.createHostElement(this.rootSelector)
    this._host.dataset.theme = this._themeName

    // insert CSS custom property definitions for the initial theme
    this.renderUnoCss()

    if (options.globalUnoCss) {
      const rawMap = options.globalUnoCss(this.theme)
      const tokens = compileSafelist(rawMap)
      this.unoCssAdapter.generate(new Set<string>(), new Set(tokens))
    }

    if (options.globalRawCss) {
      this._globalRawCss = options.globalRawCss
      this.renderRawCss()
    }
  }

  get theme(): ThemeProxy<TTheme> { return this._theme }

  /** Current root selector.  Either `#${id}` when scoped, or `:root` when global. */
  get rootSelector() { return this._isolate ? `#${this._id}` : ':root' }

  set themeName(name: string) {
    this._themeName = name
    this._theme = this.buildProxyTheme() // rebuild as some people still want to access theme's raw values
    this.renderUnoCss()
    const el = this._host
    el.dataset.theme = name
    el.classList.remove('theme-transitions-active')
    requestAnimationFrame(() => el.classList.add('theme-transitions-active'))  

    this.renderRawCss()
  }

  get themeName() {
    return this._themeName
  }

  private getInitialTheme (options: UnoThemeManagerOptions<TTheme>) {
    const firstTheme = Object.keys(options.themes)[0]
    const chosenTheme = options.initialTheme    
    if (chosenTheme) {
      if (options.themes[chosenTheme]) return chosenTheme  
      console.warn(`Initial theme "${chosenTheme}" not found—falling back to "${firstTheme}".`)
    }
    return firstTheme
  }

  private createHostElement (rootSelector: string) {        
    const host = rootSelector && rootSelector !== ':root'
        ? (document.querySelector(rootSelector) as HTMLElement | null)
        : document.documentElement

    // If the selector is an ID (e.g. "#foo") and no element exists yet, create it so we
    // don't mistakenly treat <html> as the host and overwrite its data-theme attribute.
    if (!host && rootSelector.startsWith('#')) {
      const el = document.createElement('div') as HTMLElement
      el.id = rootSelector.substring(1)
      document.body.append(el)
      return el
    }

    return host ?? document.documentElement
  }

  private buildProxyTheme = (): ThemeProxy<TTheme> =>
    walk(this._themes[this._themeName], [], this.proxyLeaf) as ThemeProxy<TTheme>

  private buildUnoTheme = () =>
    walk(this._themes[this._themeName], [], this.unoLeaf)

  private proxyLeaf = (path: string[], val: any) =>
    path[0] === 'colors'
      ? new ColorVar(path.slice(1).join('-'), String(val), this.cssVar(path))
      : new CssVar(path.slice(1).join('-'), String(val), this.cssVar(path))

  private unoLeaf = (path: string[], val: any) =>
    path[0] === 'colors'
      ? new ColorVar(path.at(-1)!, String(val), this.cssVar(path)).css
      : `var(${this.cssVar(path)})`

  private cssVar = (segments: string[]) =>
    `--${this._id}-${segments.map(kebab).join('-')}`

  private cssVars = (theme: TTheme) =>
    flatten(theme)
      .map(([path, val]) => {
        const name = this.cssVar(path)
        const raw =
          path[0] === 'colors'
            ? new ColorVar(path.at(-1)!, String(val), name).format()
            : String(val)
        return `  ${name}: ${raw};`
      })
      .join('\n')

  private renderUnoCss() {
    this._unoStyleEl = this.ensureSheet(`domeleon-uno-theme-${this._id}`)
    this._unoStyleEl.textContent = Object.entries(this._themes)
      .map(
        ([n, v]) =>
          `${this.rootSelector}[data-theme=\"${n}\"] {\n${this.cssVars(v)}\n}`
      )
      .join('\n')
  }

  private renderRawCss() {
    this._rawCssStyleEl = this.ensureSheet(`domeleon-css-theme-${this._id}`)    
    if (this._globalRawCss) {
      this._rawCssStyleEl.textContent = this._globalRawCss(this._theme)
    }
  }

  private ensureSheet(id: string): HTMLStyleElement {
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