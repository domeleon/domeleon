import type { KnownHtmlAttributes } from './htmlGenAttributes.js'
import type { KnownSvgAttributes } from './svgGenAttributes.js'
import type { PreactWithConfig } from '../renderers/preact/index.js'

export type OnUnmounted = () => void

export interface VAttributes extends Partial<KnownHtmlAttributes & KnownSvgAttributes> {
  onMounted?: (element: Element) => OnUnmounted | void
  key?: string | number
  [dataAttribute: `data-${string}`]: string
  withPreact?: PreactWithConfig
}

export type VNode = VElement | string | number

export interface VElement {
  nodeName: string
  attributes: VAttributes
  children: VNode[]
  key?: string | number
}

export function isVElement(vnode?: VNode): vnode is VElement {
  return !!vnode && typeof vnode === 'object' && 'attributes' in vnode && 'nodeName' in vnode
}