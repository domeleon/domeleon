import { Component } from '../component/component.js'
import { type IApp, type UpdateEvent } from '../component/componentTypes.js'
import { Renderer } from '../renderers/renderer.js'
import { createDefaultRenderer } from '../renderers/rendererDefault.js'
import { AppSerializer } from './appSerializer.js'
import { type CssAdapter } from '../dom/processClass.js'
import { cssManager } from '../dom/processClass.js'
import { RouteService } from '../router/routeService.js'
import { debounce } from 'domeleon/util.js'
import { AppPlugins, type AppPlugin } from './appPlugin.js'

export interface AppSetupProps {    
  rootComponent: Component,
  containerId: string,
  renderer?: Renderer<any>    
  cssAdapter?: CssAdapter
  routeService?: RouteService
  autoPersist?: boolean
  plugins?: AppPlugin<any>[]
}

export class App implements IApp {
  #rootComponent: Component
  serializer: AppSerializer
  #lock = false
  #pending = false
  #props: AppSetupProps
  #rootElement: Element | null = null  
  #containerId: string
  renderer: Renderer<any>   
  routeService: RouteService
  #saveDebounce: () => void   
  #plugins: AppPlugins

  constructor (props: AppSetupProps) {
    this.#containerId = props.containerId
    this.#rootComponent = props.rootComponent
    this.#props = props
    this.renderer = props.renderer ?? createDefaultRenderer()
    this.#rootElement = document.getElementById(props.containerId)    
    this.#saveDebounce = debounce(() => this.#save(), 200)

    this.serializer = new AppSerializer({
      containerId: props.containerId,
      rootComponent: this.#rootComponent,
      refresh: () => this.#render(),
      autoPersist: props.autoPersist ?? false
    })    
    
    this.routeService = props.routeService ?? new RouteService()
    this.routeService.init(this) 
    this.#rootComponent.ctx.attach(this)
    this.#plugins = new AppPlugins(this, props.plugins ?? [])
    this.#render()
  }

  get containerId() { return this.#containerId }  

  get rootComponent(): Component { return this.#rootComponent }

  #render() {
    if (this.#lock) {
      this.#pending = true
      return
    }
    this.#lock = true
    this.#pending = false    
        
    requestAnimationFrame(async () => {   
      try {   
        const vNode = this.#rootComponent.view()      
        await cssManager.flushClasses(this.#props.cssAdapter)
        this.#rootElement = this.renderer.patch(vNode, this.#rootElement!)
        this.rootComponent.ctx.markRendered()
        this.#plugins.onRendered()
      }
      finally {
        this.#lock = false
        if (this.#pending) {
          this.#pending = false
          this.#render()
        }
      }
    })
  }

  update(event: UpdateEvent) {      
    if (! this.serializer)
      return
    this.#plugins.onUpdated(event)
    this.#saveDebounce()
    this.#render()
  }

  #save() {    
    if (this.#props.autoPersist) {
      this.serializer.save()
    }    
  }
}