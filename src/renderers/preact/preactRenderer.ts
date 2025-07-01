import type { VElement } from '../../dom/dom.js'
import { Renderer } from '../renderer.js'
import * as preact from 'preact'
import * as preactHooks from 'preact/hooks'
import { transformer } from './preactTransformer.js'

export interface PreactRendererDeps {
  PreactLib: typeof preact
  PreactHooksLib: typeof preactHooks
  mountCallback?: (component: preact.VNode | null, targetElement: Element) => void
}
 
export class PreactRenderer extends Renderer<preact.VNode<any>> {
  private _dependencies: Required<PreactRendererDeps>
  private _PreactLib: typeof preact
  
  constructor(dependencies: PreactRendererDeps) {
    super(transformer())
    this._dependencies = {
      ...dependencies,
      mountCallback:
        dependencies.mountCallback ??
        ((component, targetElement) => {
          this._PreactLib.render(component, targetElement)
        })
    }
    this._PreactLib = this._dependencies.PreactLib
  }

  get rendererName() { return 'Preact' }

  patch(vElement: VElement, containerElement: Element): Element {
    let preactNode = this.renderVNode(vElement)
    this._dependencies.mountCallback(preactNode as preact.VNode | null, containerElement)
    return containerElement
  }

  unmount(containerElement: Element): void {        
    this._PreactLib.render(null, containerElement)
  }
}