import * as preact from 'preact'
import { h as preactH } from 'preact'
import * as preactHooks from 'preact/hooks'
import type { OnUnmounted } from '../../dom/dom.js'
import type { PreactHookConfig, PreactComponentConfig } from './index.js'

// ---OnMountAdapter Section---

export interface OnMountAdapterProps {
  onMounted: (elm: Element) => OnUnmounted | void
  preactElement: preact.VNode<any>
}

export const OnMountAdapter: preact.FunctionComponent<OnMountAdapterProps> = ({ onMounted, preactElement }) => {
  const targetRef = preactHooks.useRef<Element>(null)    
  preactHooks.useLayoutEffect(() => {
    return onMounted(targetRef.current!)
  }, [])
  return preact.cloneElement(preactElement, { ref: targetRef })
} 

// --- HookAdapter Section---

function isRef(value: unknown): value is preact.RefObject<any> {
  return !!(value && typeof value === 'object' && 'current' in value)
}

export interface HookAdapterProps {
  hookConfig: PreactHookConfig
  tag: string
  elementProps: Record<string, any>
  elementChildren: preact.ComponentChildren
}

export const HookAdapter: preact.FunctionComponent<HookAdapterProps> = ({ hookConfig, tag, elementProps, elementChildren }) => {
  const { hook, options } = hookConfig
  const hookResult = hook(options ?? {})
  
  const ref =
    isRef(hookResult?.[0]) ? hookResult[0] :
    isRef(hookResult) ? hookResult :
    null

  const finalElementProps = ! ref ? elementProps : { ...elementProps, ref }    
  return preactH(tag, finalElementProps, elementChildren)
}

// --- ComponentAdapter Section ---

export interface ComponentAdapterProps {
  componentConfig: PreactComponentConfig
  elementProps: Record<string, any>
  elementChildren: preact.ComponentChildren
}

export const ComponentAdapter: preact.FunctionComponent<ComponentAdapterProps> = ({ componentConfig, elementProps, elementChildren }) => {
  const { component: TargetComponent, componentProps = {} } = componentConfig    
  const mergedProps = { ...componentProps, ...elementProps }     
  return preactH(TargetComponent, mergedProps, elementChildren)
}