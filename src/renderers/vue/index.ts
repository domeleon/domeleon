export { VueRenderer } from './vueRenderer.js'

export type VueHookConfig = { hook: Function; options?: any; }
export type VueComponentConfig = {
  component: any
  componentProps?: Record<string, any>
}
export type VueWithConfig = VueHookConfig | VueComponentConfig

// Augment the VAttributes interface from the core domeleon package
declare module '../../index.js' {
  interface VAttributes {
    withVue?: VueWithConfig
  }
}