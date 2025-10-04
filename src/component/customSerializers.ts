export type CustomSerializer<T = any> = {
  toJSON?: (value: T) => any
  fromJSON?: (data: any) => T
}

const registry = new Map<any, CustomSerializer>([
  [Date, {
    toJSON: (v: Date) => (v instanceof Date ? v.toISOString() : v),
    fromJSON: (d: any) => {
      if (d == null) return d
      const date = d instanceof Date ? d : new Date(d)
      return isNaN(date.getTime()) ? undefined : date
    }
  }]
])

export const getCustomSerializer = (ctor: any): CustomSerializer | undefined => registry.get(ctor)
