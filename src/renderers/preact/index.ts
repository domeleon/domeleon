export type PreactHookConfig = { hook: Function; options?: any }
export type PreactComponentConfig = {
  component: any;
  componentProps?: Record<string, any>
}
export type PreactWithConfig = PreactHookConfig | PreactComponentConfig

export { PreactRenderer } from './preactRenderer.js'