import type { VAttributes } from "./dom.js"
import { normalizeUtilityClass, bracketVariantRegex } from "./processUtility.js"

export class ClassProcessor {
  private readonly _elementClasses = new Set<string>()

  addClass(value: VAttributes["class"]) : void {
    const inputs =  
      typeof value === "string" ? [value] :
      Array.isArray(value) ? value :
      []

    const tokens = inputs.flatMap(v => {
      if (! v) return []
      const bracketVariants = Array.from (v.matchAll(bracketVariantRegex), m => m[0])
      const remainder = v.replace(bracketVariantRegex, " ")
      const plainClasses = remainder
        .trim()
        .split(/\s+/g)
        .filter(Boolean)
      return [...bracketVariants, ...plainClasses]
    }).filter(Boolean)

    for (const rawToken of tokens) {
      const token = cssManager.addClass(rawToken, false) // cssManager.addClass normalizes the selector-space token
      this._elementClasses.add(token)
    }
  }

  getClassString(): string {
    return [...this._elementClasses].join(" ")
  }
}

class CssManager {
  private readonly _classes = new Set<string>()
  private readonly _stickyClasses = new Set<string>()

  addClass(cls: string, sticky: boolean) : string {
    const token = normalizeUtilityClass(cls)
    if (sticky) this._stickyClasses.add(token)
    else this._classes.add(token)
    return token
  }
  
  async flushClasses(handler?: CssAdapter): Promise<void> {
    if (!handler) return
    await handler.generate(this._classes, this._stickyClasses)
    this._classes.clear()
    this._stickyClasses.clear()
  }
}

export interface CssAdapter {
  generate (classes: Set<string>, stickyClasses: Set<string>): Promise<void>
}

export const cssManager = new CssManager()

export function stickyClass(cls: string) {
  return cssManager.addClass(cls, true)
}