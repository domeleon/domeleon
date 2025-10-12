import type { Component } from "./component.js"

export type ComponentState = "detached" | "updating" | "rendered"

export type UpdateCause = "input" | "validator" | "router" | "serializer"

export interface UpdateEvent {
  component: Component
  cause?: UpdateCause | string
  key?: string
  value?: any
}  

export interface IApp {
  update(event: UpdateEvent): void
  root: Component
}

export const componentSkipProps = ['ctx', 'serializer', "serializerMap", 'validator', 'router']

const isFunctionValue = (o: any, k: string): boolean => {
  try { return typeof o[k] === 'function' } catch { return true }
}

export const isWritable = (o: any, k: string): boolean => {
  for (let p: any = o; p; p = Object.getPrototypeOf(p)) {
    const d = Object.getOwnPropertyDescriptor(p, k)
    if (d) return !!d.set || !!d.writable
  }
  return true
}

export const keysOfComponent = (o: any): string[] => {
  const result = new Set<string>()

  // 1) own enumerable
  for (const k of Object.keys(o)) {
    if (
      !componentSkipProps.includes(k) &&
      isWritable(o, k) &&
      ! k.startsWith('_') &&
      !isFunctionValue(o, k)
    ) result.add(k)
  }

  // 2) prototype accessors (getter+setter)
  for (
    let proto = Object.getPrototypeOf(o);
    proto && proto !== Object.prototype;
    proto = Object.getPrototypeOf(proto)
  ) {
    for (const k of Object.getOwnPropertyNames(proto)) {
      if (result.has(k) || componentSkipProps.includes(k)) continue
      const d = Object.getOwnPropertyDescriptor(proto, k)!
      if (d.get && d.set && !isFunctionValue(o, k)) result.add(k)
    }
  }

  return [...result]
}