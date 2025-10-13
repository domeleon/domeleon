import { humanizeIdentifier } from '../util.js'
import { Component } from '../component/component.js'
import { type UpdateEvent } from '../component/componentTypes.js'
import { getPropertyKey, type PropertyRef } from '../util.js'

export interface InputEvent extends UpdateEvent {
  cause: "input"
}

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