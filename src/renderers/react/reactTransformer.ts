import * as React from 'react'
import type { VElementTransformer } from 'domeleon'
import { OnMountAdapter, HookAdapter, ComponentAdapter } from './reactAdapters.js'

export const transformer = (reactLib: typeof React): VElementTransformer<React.ReactElement> => ({
  transformElement: (tag, props, children) => 
    reactLib.createElement(tag as React.ElementType, props, ...children),
  transformHook: (config, tag, props, children) => 
    reactLib.createElement(HookAdapter, { 
      tag: tag, 
      elementProps: props, 
      children: children,
      hookConfig: config
    }),
  tranformComponent: (config, tag, props, children) => 
    reactLib.createElement(ComponentAdapter, { 
      tag: tag, 
      elementProps: props, 
      children: children,
      componentConfig: config
    }), 
  transformOnMounted: (frameworkElement, onMounted, originalProps) => {
    if (onMounted) {
      return reactLib.createElement(OnMountAdapter, { 
        onMounted: onMounted, 
        reactElement: frameworkElement
      })
    } 
    return frameworkElement
  },
  transformAttributeName: (name: string) =>
    name == "class" ? "className" :
    name == "for" ? "htmlFor" :
    name
  }
)