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
    public readonly name: string,
    public readonly rawValue: string,
    public readonly cssVarName: string
  ) {
  }

  toString(): string {
    return this.name;
  }

  get css(): string {
    return `var(${this.cssVarName})`
  }

  format () {
    return this.rawValue
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
