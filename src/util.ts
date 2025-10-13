export type PropertyRef<T> = string | (() => T)

/**
 * Returns the property name from a property access expression, e.g. `key(() => obj.username)` returns `"username"`.
 * For a nested property access expression, only returns the last property (e.g. `key(() => a.b.c)` returns `"c"`).
 */
export function key (propertyAccess: () => any) {
  return (""+propertyAccess).match (/\.([a-zA-Z_$][0-9a-zA-Z_$]*)[^\.]*$/)![1]
}

export const getPropertyKey = <T> (prop: PropertyRef<T>) =>
  typeof (prop) == "string" ? prop: key (prop)

export const humanizeIdentifier = (str: string) =>
  str
    .replace(/(?<=[a-z])([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/(\s|^)\w/g, m => m.toUpperCase());

export function equalsIgnoreCase(a: string, b: string) {
  if (a == b) return true
  if (a == null || b == null) return false
  return a.toLowerCase() == b.toLowerCase()
}

export function fuzzyEquals(x: any, y: any) {
  return (
    x == y ||
    isNullOrEmpty(x) && isNullOrEmpty(y) ||
    (typeof(x) == "string" && typeof(y) == "string" && (parseFloat(x) == parseFloat(y)))
  )
}

export const parseFloatDeNaN = (s: string) => {
  const n = parseFloat(s)
  return isNaN(n) ? undefined : n
}

export function isNullOrEmpty(s?: string | null) {
  return s == null || s === ''
}

export const kebab = (s: string) => s.replace(/([A-Z])/g, '-$1').toLowerCase()

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let t: ReturnType<typeof setTimeout>
  return function (this: ThisParameterType<T>, ...args: Parameters<T>): Promise<ReturnType<T>> {
    clearTimeout(t)
    return new Promise<ReturnType<T>>(resolve => {
      t = setTimeout(() => resolve(fn.apply(this, args)), ms)
    })
  }
}

// Returns the leading elements of an array while predicate(element) is true
export function takeWhile<T>(arr: readonly T[], pred: (x: T, idx: number) => boolean): T[] {
  const out: T[] = []
  for (let i = 0; i < arr.length; i++) {
    if (!pred(arr[i], i)) break
    out.push(arr[i])
  }
  return out
}

export function freezeProps(obj: any, keys: string[]) {
  for (const key of keys) {
    Object.defineProperty(obj, key, {
      value: obj[key],
      writable: false,
      configurable: false,
      enumerable: true
    })
  }
}