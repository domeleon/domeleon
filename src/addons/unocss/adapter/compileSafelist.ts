type SafelistMap = Record<string, string>   // selector → space-separated utilities

export function compileSafelist (defs: SafelistMap): string[] {
  return Object.entries(defs).flatMap(([sel, list]) =>
    list.trim().split(/\s+/).map(u => `g(${sel}):${u}`),
  )
}