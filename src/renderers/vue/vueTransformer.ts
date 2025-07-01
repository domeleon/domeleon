import { h as vueH, type VNode as VueVNodeType } from 'vue'
import type { FrameworkAttrs, OnUnmounted, VElementTransformer } from '../../index.js'
import { ComponentAdapter, ComposableAdapter } from './vueAdapters.js'
import { isAttrEvent, nativiseAttrName } from '../domNaming.js'

type ElementWithUnmount = Element & {
  domeleonOnUnmount?: OnUnmounted | void
}

export const transformer = () : VElementTransformer<VueVNodeType> => ({
  transformElement: (tag: string, attrs: FrameworkAttrs, children: VueVNodeType[]) => vueH(tag, attrs, children),
  transformHook: (config: any, tag: string, attrs: FrameworkAttrs, children: VueVNodeType[]) =>
    vueH(ComposableAdapter, {
      elementProps: attrs,
      elementChildren: children,
      hookOptions: config.options ?? {},
      tag: tag,
      hookFn: config.hook as (options: any) => any
    }),
  tranformComponent: (config: any, tag: string, attrs: FrameworkAttrs, children: VueVNodeType[]) =>
    vueH(ComponentAdapter, {
      elementProps: attrs,
      elementChildren: children,
      componentConfig: config
    }), 
  transformOnMounted: (frameworkElement: VueVNodeType, onMounted: (el: Element) => OnUnmounted | void, originalAttrs: FrameworkAttrs) => {
    (originalAttrs as any).onVnodeMounted = (vueElement: { el: ElementWithUnmount }) => {
      vueElement.el.domeleonOnUnmount = onMounted(vueElement.el)
    }
    (originalAttrs as any).onVnodeBeforeUnmount = (vueElement: { el: ElementWithUnmount }) => {
      vueElement.el.domeleonOnUnmount?.()
      delete vueElement.el.domeleonOnUnmount
    }
    return frameworkElement
  },
  transformAttributeName: (name, isSVG) =>
    isAttrEvent(name) ? 'on' + name[2] + name.substring(3).toLowerCase() :
    nativiseAttrName(name, isSVG),
  transformAttributes: (tag: string, attrs: FrameworkAttrs) => {
    if (tag === 'select' && 'type' in attrs) {
      delete attrs.type
    }
    return attrs
  }
})