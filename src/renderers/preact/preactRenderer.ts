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
  #dependencies: Required<PreactRendererDeps>
  #PreactLib: typeof preact
  
  constructor(dependencies: PreactRendererDeps) {
    super(transformer())
    this.#dependencies = {
      ...dependencies,
      mountCallback:
        dependencies.mountCallback ??
        ((component, targetElement) => {
          this.#PreactLib.render(component, targetElement)
        })
    }
    this.#PreactLib = this.#dependencies.PreactLib
  }

  get rendererName() { return 'Preact' }

  patch(vElement: VElement, containerElement: Element): Element {
    let preactNode = this.renderVNode(vElement)
    this.#dependencies.mountCallback(preactNode as preact.VNode | null, containerElement)
    return containerElement
  }

  unmount(containerElement: Element): void {        
    this.#PreactLib.render(null, containerElement)
  }
}