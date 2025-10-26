import React from 'react'
import type { OnUnmounted } from 'domeleon'
import type { ReactHookConfig, ReactComponentConfig } from './index.js'
import { RefForwardingChildWrapper } from './refForwardingWrapper.js'

// ---OnMountAdapter Section ---

export interface OnMountAdapterProps {
  onMounted: (elm: Element) => OnUnmounted | void
  reactElement: React.ReactElement
}

export const OnMountAdapter: React.FC<OnMountAdapterProps> = ({ onMounted, reactElement }) => {
  const targetRef = React.useRef<Element>(null)    
  React.useLayoutEffect(() => {            
    return onMounted(targetRef.current!)    
  }, [])
  return React.cloneElement(reactElement, { ref: targetRef } as React.Attributes)
} 

// --- HookAdapter Section --- 

function isRef(value: unknown): value is React.RefObject<any> {
  return !!(value && typeof value === 'object' && 'current' in value)
}

export interface HookAdapterProps {
  hookConfig: ReactHookConfig
  tag: string
  elementProps: Record<string, any>
  children: React.ReactNode
  key?: React.Key
}

export const HookAdapter: React.FC<HookAdapterProps> = ({ hookConfig, tag, elementProps, children }) => {
  const { hook, options } = hookConfig
  const hookResult = hook(options ?? {})

  let ref: React.Ref<Element> =
    typeof hookResult?.[0] !== 'undefined' ? hookResult[0]:
    typeof hookResult?.ref !== 'undefined' ? hookResult.ref :
    elementProps.ref

  const finalElementProps = {
    ...elementProps,        
    ref: React.useCallback((elm: Element) => {
      if (typeof ref === 'function') {
        ref(elm)
      }
      else if (isRef(ref)) {
        (ref as React.MutableRefObject<Element>).current = elm
      }
    }, [ref])        
  }

  return React.createElement(tag, finalElementProps, children)
}

// --- ComponentAdapter Section --- 

export interface ComponentAdapterProps {
  componentConfig: ReactComponentConfig
  tag: string
  elementProps: Record<string, any>
  children: React.ReactNode
  key?: React.Key
}

export const ComponentAdapter: React.FC<ComponentAdapterProps> = ({ componentConfig, tag, elementProps, children }) => {
  const {
    component: FeatureComponent,
    componentProps = {},
    childWrapper: ChildWrapper,
    childWrapperProps = {},
    childProcessingMode = componentConfig.childProcessingMode ?? (ChildWrapper ? 'map' : 'passthrough'),
    childWrapperRefPropName
  } = componentConfig

  const processedChildren = React.useMemo(() => {
    if (!ChildWrapper || childProcessingMode === 'passthrough' || !children) {
      return children
    }

    const wrapChild = (child: React.ReactNode, index: number): React.ReactNode => {
      if (React.isValidElement(child)) {
        const key = child.key ?? index
        const { childWrapper, childWrapperProps, childWrapperRefPropName } = componentConfig
        
        if (childWrapper && childWrapperRefPropName) {
          return React.createElement(RefForwardingChildWrapper, {
            key,
            targetComponent: childWrapper,
            targetProps: { ...childWrapperProps },
            refPropName: childWrapperRefPropName,
            children: child
          })
        } else if (childWrapper) {
          return React.createElement(childWrapper, { key, ...childWrapperProps }, child)
        }
      }
      return child
    }

    const firstValidIndex = childProcessingMode === 'single' ?
      React.Children.toArray(children).findIndex(React.isValidElement) :
      -1

    return React.Children.map(children, (child, index) => {            
      if (childProcessingMode === 'map') {
        return wrapChild(child, index)
      }            
      if (childProcessingMode === 'single') {
        return index !== firstValidIndex ?
          child :
          wrapChild(child, index)
      }            
      return child
    })

  }, [children, ChildWrapper, childWrapperProps, childProcessingMode, childWrapperRefPropName])

  const finalComponentProps = { tag, ...componentProps, ...elementProps}
  return React.createElement(FeatureComponent, finalComponentProps, processedChildren)
} 