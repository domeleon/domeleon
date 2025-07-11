import * as React from 'react'
import type { VElement } from '../../index.js'
import { Renderer } from '../renderer.js'
import ReactDOM, { type Root as ReactRoot } from 'react-dom/client'
import { transformer } from './reactTransformer.js'

export interface ReactRendererDeps {
  ReactLib: typeof React
  ReactDOMClientLib: typeof ReactDOM
  mountCallback?: (component: React.ReactNode, targetElement: Element) => void
}

export class ReactRenderer extends Renderer<React.ReactElement> {
  private _dependencies: Required<ReactRendererDeps>
  private _containerToReactRootMap = new Map<Element, ReactRoot>()

  constructor(dependencies: ReactRendererDeps) {
    super(transformer(dependencies.ReactLib))
    this._dependencies = {
      ...dependencies,
      mountCallback: dependencies.mountCallback ?? this.defaultMountCallback
    }
  }

  get rendererName() { return 'React' }

  private defaultMountCallback = (component: React.ReactNode, targetElement: Element): void => {
    let root = this._containerToReactRootMap.get(targetElement)
    if (!root) {
      root = this._dependencies.ReactDOMClientLib.createRoot(targetElement)
      this._containerToReactRootMap.set(targetElement, root)
    }        
    root.render(component)
  }

  patch(vElement: VElement, element: Element): Element {
    this._dependencies.mountCallback(this.renderVNode(vElement), element)
    return element
  } 

  unmount(containerElement: Element): void {
    const root = this._containerToReactRootMap.get(containerElement)
    if (root) {
      root.unmount()
      this._containerToReactRootMap.delete(containerElement)
    }
  }
}