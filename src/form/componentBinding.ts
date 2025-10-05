import { humanizeIdentifier } from '../util.js'
import { Component } from '../component/component.js'
import { type UpdateEvent } from '../component/componentTypes.js'

export type PropertyRef<T> = string | (() => T)

export interface InputEvent extends UpdateEvent {
  cause: "input"
}

/**
 * Returns the property name from a property access expression, e.g. `key(() => obj.username)` returns `"username"`.
 * For a nested property access expression, only returns the last property (e.g. `key(() => a.b.c)` returns `"c"`).
 */
export function key (propertyAccess: () => any) {
  return (""+propertyAccess).match (/\.([a-zA-Z_$][0-9a-zA-Z_$]*)[^\.]*$/)![1]
}

export const getPropertyKey = <T> (prop: PropertyRef<T>) =>
  typeof (prop) == "string" ? prop: key (prop)

export const getPropertyValue = <T> (obj: Component, prop: PropertyRef<T>) =>
  (obj as any)[getPropertyKey (prop)] as T

export const setPropertyValue = <T> (obj: Component, prop: PropertyRef<T>, value: T) => {    
  const key = getPropertyKey (prop)
  if (value != getPropertyValue (obj, prop)) {
    (obj as any)[key] = value
    obj.update(<InputEvent>{ cause: "input", key, value })    
  }
}

export const getLabel = <T>(target: Component & Partial<ILabeled>, prop: PropertyRef<T>) => {
  const k = getPropertyKey(prop)
  const labels = target.getLabels?.() as ILabelMap | undefined
  const entry = labels?.[k]
  if (typeof entry === "string") return entry
  return entry?.label ?? humanizeIdentifier(k)
}

export const getDescription = <T>(target: Component & Partial<ILabeled>, prop: PropertyRef<T>) => {
  const k = getPropertyKey(prop)
  const labels = target.getLabels?.() as ILabelMap | undefined
  const entry = labels?.[k]
  if (typeof entry === "object" && entry !== null) return entry.description
  return undefined
}

export interface DataBindProps<T> {
  target: Component
  prop: PropertyRef<T>
  id?: string
}

export interface ILabeled {
  getLabels(): ILabelMap
}

export interface ILabelMap {
  [property: string]: string | ILabel
}

export interface ILabel {
  /** The label to display for this field (localizable). */
  label?: string
  /** Optional description/help text for this field (localizable). */
  description?: string
  // Add more metadata fields as needed (e.g., placeholder, tooltip, etc)
}

