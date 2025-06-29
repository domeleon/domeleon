import type { VAttributes, VElement, VNode } from './dom.js'
import { ClassProcessor } from './processClass.js'
import { StyleProcessor } from './processStyle.js'

export type HValue = VNode | VAttributes | null | undefined
export type HValues = HValue | HValues[]

const isAttribute = (v: any): v is VAttributes =>
  typeof v === 'object' &&
  v !== null &&
  ! Array.isArray (v) &&
  ! (v instanceof Date) &&
  'nodeName' in v === false &&
  'view' in v === false

const squash = (xs: HValues[]): VNode[] =>
  xs.flatMap(x =>
    Array.isArray(x)
      ? squash(x)
      : x != null && ! isAttribute(x)
        ? [x as VNode]
        : []
  )

export function mergeAttrs(...attrs: (VAttributes | null | undefined)[]): VAttributes {
  const cls = new ClassProcessor()
  const sty = new StyleProcessor()
  const merged: VAttributes = {}

  for (const a of attrs) {
    if (a) {
      for (const k in a) {
        const v = (a as any)[k]
        if (k === 'class') cls.addClass(v)
        else if (k === 'style') sty.addStyle(v)
        else if (k === 'key') v != null && (merged.key = v)
        else v != null && ((merged as any)[k] = v)
      }
    }
  }
  merged.style = sty.styles
  const c = cls.getClassString()
  c && (merged.class = c)
  return merged
}

export function h(tagName: string, ...values: HValues[]) : VElement {
  const i = values.findIndex (v => v != null && ! isAttribute(v) && typeof v !== 'boolean')
  const end = i < 0 ? values.length : i
  const attrs = mergeAttrs (...values.slice(0, end).filter (isAttribute))
  const children = squash (values.slice(end))
  return {
    nodeName: tagName,
    attributes: attrs,
    children,
    key: attrs.key
  }
}