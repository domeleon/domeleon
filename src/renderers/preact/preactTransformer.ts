import { OnMountAdapter, HookAdapter, ComponentAdapter } from "./preactAdapters.js"
import { type VElementTransformer } from "../renderer.js"
import * as preact from 'preact'
import { isAttrEvent, nativiseAttrName } from "../domNaming.js"

export const transformer = (): VElementTransformer<preact.VNode<any>> => ({
  transformElement: (tag, attrs, children) => preact.h(tag, attrs, children),
  transformHook: (config, tag, attrs, children) => 
    preact.h(HookAdapter, { 
      key: attrs.key,
      elementProps: attrs, 
      elementChildren: children, 
      hookConfig: config,
      tag: tag 
    }), 
  tranformComponent: (config, tag, attrs, children) => 
    preact.h(ComponentAdapter, { 
      key: attrs.key,
      elementProps: attrs, 
      elementChildren: children, 
      componentConfig: config
    }),
  transformAttributeName: (name, isSVG) =>
    isAttrEvent(name) ? name : nativiseAttrName(name, isSVG),
  // The wrapper must carry the element's key: an unkeyed adapter is reused across a key change,
  // so its once-per-mount effect never refires even though the DOM element beneath was replaced.
  transformOnMounted: (frameworkElement, onMounted, originalAttrs) =>
    preact.h(OnMountAdapter, {
      key: originalAttrs.key,
      onMounted: onMounted,
      preactElement: frameworkElement
    })
})
