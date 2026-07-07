import * as React from 'react'
import type { VElementTransformer } from 'domeleon'
import { OnMountAdapter, HookAdapter, ComponentAdapter } from './reactAdapters.js'
import { svgCompoundWordAttrs } from '../domNaming.js'

export const transformer = (reactLib: typeof React): VElementTransformer<React.ReactElement> => ({
  transformElement: (tag, props, children) => 
    reactLib.createElement(tag as React.ElementType, props, ...children),
  transformHook: (config, tag, props, children) => 
    reactLib.createElement(HookAdapter, { 
      key: props.key,
      tag: tag, 
      elementProps: props, 
      children: children,
      hookConfig: config
    }),
  tranformComponent: (config, tag, props, children) => 
    reactLib.createElement(ComponentAdapter, { 
      key: props.key,
      tag: tag, 
      elementProps: props, 
      children: children,
      componentConfig: config
    }), 
  // The wrapper must carry the element's key: an unkeyed adapter is reused across a key change,
  // so its once-per-mount effect never refires even though the DOM element beneath was replaced.
  transformOnMounted: (frameworkElement, onMounted, originalProps) => {
    if (onMounted) {
      return reactLib.createElement(OnMountAdapter, { 
        key: originalProps.key,
        onMounted: onMounted, 
        reactElement: frameworkElement
      })
    } 
    return frameworkElement
  },
  transformAttributeName: (name: string) =>
    name == "class" ? "className" :
    name == "for" ? "htmlFor" :
    svgCompoundWordAttrs.has(name) ? svgCompoundWordAttrs.get(name)!.react :
    name
  }
)