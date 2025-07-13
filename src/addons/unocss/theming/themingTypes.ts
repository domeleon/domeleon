/**
 * A leaf theme value: a CSS-ready string. Numbers are disallowed to
 * avoid unit-omission bugs; numeric quantities must be converted to
 * strings with appropriate units by the theme author.
 */
export type UnoCssValue = string

/**
 * Recursively defines a set of CSS values: nested property groups.
 * Example:
 * {
 *   colors: {
 *     primary: "#ff0000",
 *     shades: {
 *       light: "#ffcccc",
 *       dark: "#cc0000"
 *     }
 *   },
 *   spacing: {
 *     small: "4px",
 *     medium: "8px"
 *   }
 * }
 */
export interface UnoCssSet {
  [key: string]: UnoCssValue | UnoCssSet
}

/**
 * A complete theme: maps top‑level groups (e.g., "colors", "spacing")
 * to their nested CSS sets.
 */
export type Theme = Record<string, UnoCssSet>

/**
 * Maps theme names (e.g., "light", "dark") to their definitions.
 */
export type ThemeSet<T extends Theme> = Record<string, T>

/**
 * Generic CSS variable managed by the theme system.
 * Holds semantic name, original value, and CSS custom property name.
 */
export class CssVar {
  constructor(
    /** The unocss name, e.g.: `textPrimary` */
    public readonly name: string,
    /** Returns the raw value defined in a specific theme, e.g.: `rgb(0, 187, 0)` */
    public readonly rawValue: string,

    /** REturns the css variables name, e.g.: `--app-colors-text-primary` */
    public readonly cssVarName: string
  ) {
  }

  /** Returns the name, e.g. `textPrimary` */
  toString(): string {
    return this.name;
  }

  /*** Returns the var, wrapped in rgb when a color, e.g.:  `rgb(var(--app-colors-text-primary))` */
  get css(): string {
    return `var(${this.cssVarName})`
  }

  /** Returns a formatted value,  raw value, e.g.: `0 187 0` */
  format () {
    return this.rawValue
  }

  /**
   * Applies a CssVar with an alpha value from 0 to 1 to a color.
   * 
   * Useful when themes diverge in transparency values.
   * ```
   * `bg-${backgroundPrimary.alpha(panelAlpha)}`
   * ```
   * To hard code a transparency value, simply use standard unocss syntax:
   * ```
   * `bg-${backgroundPrimary}/50`
   * ```  
   */
  alpha(alpha: CssVar) {
    console.warn('alpha can only be called on a color.')
    return this.name
  }
}

/**
 * Recursively mirrors a theme or CSS set, replacing each leaf value
 * with a CssVar, and preserving nested structure.
 */
export type ThemeProxy<T> = {
  [K in keyof T]:
    T[K] extends UnoCssValue
      ? CssVar
      : T[K] extends Record<string, any>
        ? ThemeProxy<T[K]>
        : never
}
