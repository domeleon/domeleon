export type CustomSerializer<T = any> = {
  toJSON?: (value: T) => any
  fromJSON?: (data: any) => T
}

const registry = new Map<any, CustomSerializer>([
  [Date, {
    toJSON: (v: Date) => (v instanceof Date ? v.toISOString() : v),
    fromJSON: (d: any) => (d instanceof Date ? d : new Date(d)),
  }]
])

export const getCustomSerializer = (ctor: any): CustomSerializer | undefined => registry.get(ctor)
