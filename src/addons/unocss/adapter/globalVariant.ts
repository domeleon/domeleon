import type { Variant } from '@unocss/core'

export const globalVariant: Variant = {
  name: 'global',
  match (matcher) {
    const m = matcher.match(/^g\(([^)]+)\):(.*)$/)
    if (!m) return          // not for us
    const [, selector, rest] = m
    return {
      matcher: rest,        // forward the utility part
      selector: () => selector,   // overwrite selector
    }
  },
}