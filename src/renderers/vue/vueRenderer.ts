import { createApp, defineComponent, shallowRef, type App as VueApp, type VNode as VueVNodeType } from 'vue'
import { Renderer, type VElement } from '../../index.js'
import { transformer } from './vueTransformer.js'

export class VueRenderer extends Renderer<VueVNodeType> {
    #containerToAppMap = new Map<Element, VueApp>()
    #containerToUpdateFnMap = new Map<Element, (newVNode: VElement) => void>()

    constructor() {
        super(transformer())
    }

    public get rendererName(): string { return 'Vue' }
 
    public patch(vElement: VElement, containerElement: Element): Element {
        let vueApp = this.#containerToAppMap.get(containerElement)
        let updateFn = this.#containerToUpdateFnMap.get(containerElement)
        
        if (!vueApp) {
            const rendererInstance = this
            const RootComponent = defineComponent({
                setup: () => {
                    const rootVNode = shallowRef<VueVNodeType | null>(null)                    
                    const internalUpdateFn = (newVNodeElement: VElement) => {
                        rootVNode.value = rendererInstance.renderVNode(newVNodeElement)
                    }                    
                    rendererInstance.#containerToUpdateFnMap.set(containerElement, internalUpdateFn)                    
                    return () => rootVNode.value
                }                
            })
            
            vueApp = createApp(RootComponent)
            this.#containerToAppMap.set(containerElement, vueApp)
            vueApp.mount(containerElement)            
            updateFn = this.#containerToUpdateFnMap.get(containerElement)
        }
        
        if (updateFn) {
            updateFn(vElement)
        }
        
        return containerElement
    }

    unmount(containerElement: Element): void {
        const vueApp = this.#containerToAppMap.get(containerElement)
        if (vueApp) {
            vueApp.unmount()
            this.#containerToAppMap.delete(containerElement)
            this.#containerToUpdateFnMap.delete(containerElement)
        }
    }
} 