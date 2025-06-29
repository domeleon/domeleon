export type ReactHookConfig = { hook: Function, options?: any }
export type ReactComponentConfig = {
  component: any
  componentProps?: Record<string, any>
  childWrapper?: any
  childWrapperProps?: Record<string, any>
  childProcessingMode?: 'map' | 'single' | 'passthrough'
  childWrapperRefPropName?: string
}
export type ReactWithConfig = ReactHookConfig | ReactComponentConfig
export { ReactRenderer } from './reactRenderer.js'

// Augment the VAttributes interface from the core domeleon package
declare module '../../index.js' {
  interface VAttributes {
    withReact?: ReactWithConfig
  }
}