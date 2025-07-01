import { OnMountAdapter, HookAdapter, ComponentAdapter } from "./preactAdapters.js"
import { type VElementTransformer } from "../renderer.js"
import * as preact from 'preact'
import { isAttrEvent, nativiseAttrName } from "../domNaming.js"

export const transformer = (): VElementTransformer<preact.VNode<any>> => ({
  transformElement: (tag, attrs, children) => preact.h(tag, attrs, children),
  transformHook: (config, tag, attrs, children) => 
    preact.h(HookAdapter, { 
      elementProps: attrs, 
      elementChildren: children, 
      hookConfig: config,
      tag: tag 
    }), 
  tranformComponent: (config, tag, attrs, children) => 
    preact.h(ComponentAdapter, { 
      elementProps: attrs, 
      elementChildren: children, 
      componentConfig: config
    }),
  transformAttributeName: (name, isSVG) =>
    isAttrEvent(name) ? name : nativiseAttrName(name, isSVG),
  transformOnMounted: (frameworkElement, onMounted, originalAttrs) =>
    preact.h(OnMountAdapter, {
      onMounted: onMounted,
      preactElement: frameworkElement
    })
})
