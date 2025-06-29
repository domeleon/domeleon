import { isVElement, type OnUnmounted, type VElement, type VNode } from '../dom/dom.js'
import { isAttrAria, isSvgEl } from './domNaming.js'

const standardBooleanAttributes = new Set([
  'checked', 'selected', 'disabled', 'readonly', 'multiple', 'required'
])

export type FrameworkAttrs = Record<string, any>

export type VElementTransformer<FrameworkNode> = {
  transformElement: (tag: string, attrs: FrameworkAttrs, children: FrameworkNode[]) => FrameworkNode
  transformHook: (hookConfig: any, tag: string, attrs: FrameworkAttrs, children: FrameworkNode[]) => FrameworkNode
  tranformComponent: (componentConfig: any, tag: string, props: FrameworkAttrs, children: FrameworkNode[]) => FrameworkNode
  transformOnMounted: (frameworkElement: FrameworkNode, onMounted: (el: Element) => OnUnmounted | void, originalProps: FrameworkAttrs) => FrameworkNode
  transformAttributeName?: (domEventName: string, isSVG: boolean) => string
  transformAttributes?: (tag: string, attrs: FrameworkAttrs) => FrameworkAttrs
}

export abstract class Renderer<FrameworkNode> {
  #transformer: VElementTransformer<FrameworkNode>

  abstract get rendererName(): string
  abstract patch(vElement: VElement, element: Element): Element

  constructor(transformer: VElementTransformer<FrameworkNode>) {
    this.#transformer = transformer
  }

  protected renderVNode(node: VNode): FrameworkNode {
    if (!isVElement(node)) {
      return node as unknown as FrameworkNode
    }
    
    const transformer = this.#transformer
    const vElement = node
    const attributes = vElement.attributes
    let frameworkAttrs: FrameworkAttrs = {}
    const isSVG = isSvgEl(vElement.nodeName)

    for (const attrKey in attributes) {
      if (attrKey === 'key' || attrKey === 'onMounted' || attrKey.startsWith('with')) {
        continue
      }
      const value = (attributes as any)[attrKey]
      if (isAttrAria(attrKey)) {
        frameworkAttrs[attrKey.replace("aria", "aria-").toLowerCase()] = value
        continue
      }
      if (standardBooleanAttributes.has(attrKey)) {
        frameworkAttrs[attrKey] = Boolean(value)
        continue
      }
      if (transformer.transformAttributeName) {
        frameworkAttrs[transformer.transformAttributeName(attrKey, isSVG)] = value
      } else {
        frameworkAttrs[attrKey] = value
      }
    }

    frameworkAttrs = !transformer.transformAttributes
      ? frameworkAttrs
      : transformer.transformAttributes(vElement.nodeName, frameworkAttrs)

    const withXxxConfig: any = (attributes as any)["with" + this.rendererName]
    const children = vElement.children.map(child => this.renderVNode(child))
    const isHook = withXxxConfig && 'hook' in withXxxConfig
    const isComp = withXxxConfig && 'component' in withXxxConfig
    
    if (attributes.key !== undefined) {
      frameworkAttrs.key = attributes.key
    }

    let element =
      isHook ? transformer.transformHook(withXxxConfig, vElement.nodeName, frameworkAttrs, children)
      : isComp ? transformer.tranformComponent(withXxxConfig, vElement.nodeName, frameworkAttrs, children)
      : transformer.transformElement(vElement.nodeName, frameworkAttrs, children)

    return !attributes.onMounted
      ? element
      : transformer.transformOnMounted(element, attributes.onMounted, frameworkAttrs)
  }
}