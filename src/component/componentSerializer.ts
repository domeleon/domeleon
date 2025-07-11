import { Component } from './component.js'
import { type UpdateEvent } from './componentTypes.js'
import { getCustomSerializer } from './customSerializers.js'

export class ComponentSerializer<T extends Component> {
  constructor(readonly component: T) {}

  /**
   * Serialize the component into a JSON object, recursing into child components.
   * 
   * Only read/write properties as described by `ctx.dataKeys` will be serialized.
   * 
   * Automatically called when an App is saved to local storage.
   * 
   * Usage:
   * 
   * ```ts
   * class MyComponent extends Component {
   *   a = "hello"
   *   b = [1,2]
   * 
   *   testSerialize() {
   *     const json = this.serializer.serialize() // { a: "hello", b: [1,2] }
   *   }
   * }
   * ```
   */
  serialize() {
    const out: Record<string, any> = {}
    const types = getTypes(this.component)

    for (const k of dataKeys(this.component)) {
      const v = (this.component as any)[k]

      if (v instanceof Component) {
        out[k] = v.serializer.serialize()
      } else if (Array.isArray(v)) {
        out[k] = v.map(i => {
          if (i instanceof Component) return i.serializer.serialize()
          const ser = i?.constructor ? getCustomSerializer(i.constructor) : undefined
          return ser?.toJSON ? ser.toJSON(i) : clone(i)
        })
      } else if (isPrimitive(v) || isPlain(v)) {
        out[k] = v
      } else if (k in types) {
        const ser = getCustomSerializer(types[k])
        out[k] = ser?.toJSON ? ser.toJSON(v) : clone(v)
      }
    }

    return out
  }

  /**
   * Deserialize a JSON object into the component, recursing into child components.
   * 
   * Automatically called when an App is loaded from local storage.
   * 
   * Usage:
   * 
   * ```ts
   * class MyComponent extends Component {
   *   a: string
   *   b: number[]
   * 
   *   test() {
   *     this.serializer.deserialize ({ a: "hello", b: [1,2] })
   *   }
   * }
   * ```
   */
  deserialize(data: any, outermost = true) {
    if (!data) return

    const types = getTypes(this.component)
    const serialKeys = new Set(dataKeys(this.component))
    const target: any = this.component

    for (const [k, rv] of Object.entries(data)) {
      if (!serialKeys.has(k)) continue

      const typeInfo = types[k]
      const cv = target[k]

      /* 1. statically typed property */
      if (typeInfo) {
        if (Array.isArray(typeInfo) && Array.isArray(rv)) {
          const Elem = typeInfo[0]
          target[k] = rv.map((item: any, i: number) =>
            cv?.[i] instanceof Elem
              ? (cv[i].serializer?.deserialize?.(item, false), cv[i])
              : constructFromJSON(Elem, item)
          )
          continue
        }

        if (!Array.isArray(typeInfo) && !Array.isArray(rv)) {
          if (cv instanceof Component) {
            cv.serializer.deserialize(rv, false)
            target[k] = cv       // reuse existing component instance
          } else {
            target[k] = constructFromJSON(typeInfo, rv)  // Date & other non-component classes
          }
          continue
        }
        // shape mismatch – fall through
      }

      /* 2. merge into existing Component */
      if (cv instanceof Component) {
        cv.serializer.deserialize(rv, false)
        continue
      }

      /* 3. array handling */
      if (Array.isArray(cv) && Array.isArray(rv)) {
        if (!typeInfo) { target[k] = rv; continue }

        const n = Math.min(cv.length, rv.length)
        for (let i = 0; i < n; i++) {
          const c = cv[i], r = rv[i]
          if (c instanceof Component) {
            c.serializer.deserialize(r, false)
          } else if (isPlain(c) && isPlain(r)) {
            Object.assign(c, r)
          } else {
            cv[i] = r
          }
        }
        continue
      }

      /* 4. primitive / plain / array overwrite */
      if (isPrimitive(rv) || isPlain(rv) || Array.isArray(rv)) target[k] = rv
    }    

    if (outermost) { this.component.update({ cause: "serializer" }) }
  }
}

export interface SerializerEvent extends UpdateEvent {
  cause: "serializer"
}

const isPrimitive = (v: any) =>
  v == null || (typeof v !== 'object' && typeof v !== 'function')

const isPlain = (v: any) => {
  const p = v && typeof v === 'object' ? Object.getPrototypeOf(v) : null
  return p === Object.prototype || p === null
}

export const isWritable = (o: any, k: string): boolean => {
  for (let p: any = o; p; p = Object.getPrototypeOf(p)) {
    const d = Object.getOwnPropertyDescriptor(p, k)
    if (d) return !!d.set || !!d.writable
  }
  return true
}

const skipProps = ['ctx', 'serializer', 'validator', 'router']

const isFunctionValue = (o: any, k: string): boolean => {
  try { return typeof o[k] === 'function' } catch { return true }
}

export const dataKeys = (o: any): string[] => {
  const keys = new Set<string>()

  // 1) own enumerable
  for (const k of Object.keys(o)) {
    if (
      !skipProps.includes(k) &&
      isWritable(o, k) &&
      !isFunctionValue(o, k)
    ) keys.add(k)
  }

  // 2) prototype accessors (getter+setter)
  for (
    let proto = Object.getPrototypeOf(o);
    proto && proto !== Object.prototype;
    proto = Object.getPrototypeOf(proto)
  ) {
    for (const k of Object.getOwnPropertyNames(proto)) {
      if (keys.has(k) || skipProps.includes(k)) continue
      const d = Object.getOwnPropertyDescriptor(proto, k)!
      if (d.get && d.set && !isFunctionValue(o, k)) keys.add(k)
    }
  }

  return [...keys]
}

export const isDataKey = (o: any, k: string) => dataKeys(o).includes(k)

const getTypes = (c: Component) => (c as any).getTypes?.() ?? {}

const clone = (v: any) => JSON.parse(JSON.stringify(v))

const constructFromJSON = (ctor: any, data: any): any => {
  if (!ctor) return data
  
  // 1. custom handler registered in the global registry
  const custom = getCustomSerializer(ctor)
  if (custom?.fromJSON) return custom.fromJSON(data)

  // 2. Custom static deserializer provided by the class itself.
  if (typeof ctor.fromJSON === 'function') {
    const inst = ctor.fromJSON(data)
    return inst
  }
 
  // 3. Generic construction + nested component hydration
  const inst = new ctor(data)
  if (inst instanceof Component) inst.serializer.deserialize(data)
  return inst
}