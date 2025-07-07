import { Component } from '../component/component.js'
import { type IApp, type UpdateEvent } from '../component/componentTypes.js'
import { Renderer } from '../renderers/renderer.js'
import { createDefaultRenderer } from '../renderers/rendererDefault.js'
import { AppSerializer } from './appSerializer.js'
import { type CssAdapter } from '../dom/processClass.js'
import { cssManager } from '../dom/processClass.js'
import { RouteService } from '../router/routeService.js'
import { debounce } from '../util.js'
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
  private _lock = false
  private _pending = false  
  readonly serializer: AppSerializer
  readonly renderer: Renderer<any>   
  readonly routeService: RouteService
  private readonly _rootComponent: Component    
  private readonly _props: AppSetupProps
  private readonly _rootElement: Element | null = null  
  private readonly _containerId: string
  private readonly _saveDebounce: () => void   
  private readonly _plugins: AppPlugins

  constructor (props: AppSetupProps) {
    this._containerId = props.containerId
    this._rootComponent = props.rootComponent
    this._props = props
    this.renderer = props.renderer ?? createDefaultRenderer()
    this._rootElement = document.getElementById(props.containerId)    
    this._saveDebounce = debounce(() => this._save(), 200)

    this.serializer = new AppSerializer({
      containerId: props.containerId,
      rootComponent: this._rootComponent,
      refresh: () => this._render(),
      autoPersist: props.autoPersist ?? false
    })    
    
    this.routeService = props.routeService ?? new RouteService()
    this.routeService.init(this) 
    this._rootComponent.ctx.attach(this)
    this._plugins = new AppPlugins(this, props.plugins ?? [])
    this._render()
  }

  get containerId() { return this._containerId }  

  get rootComponent(): Component { return this._rootComponent }

  private _render() {
    if (this._lock) {
      this._pending = true
      return
    }
    this._lock = true
    this._pending = false    
        
    requestAnimationFrame(async () => {   
      try {   
        const vNode = this._rootComponent.view()      
        await cssManager.flushClasses(this._props.cssAdapter)
        this.renderer.patch(vNode, this._rootElement!)
        this.rootComponent.ctx.markRendered()
        this._plugins.onRendered()
      }
      finally {
        this._lock = false
        if (this._pending) {
          this._pending = false
          this._render()
        }
      }
    })
  }

  update(event: UpdateEvent) {      
    if (! this.serializer || ! this._plugins)
      return
    this._plugins.onUpdated(event)
    this._saveDebounce()
    this._render()
  }

  private _save() {    
    if (this._props.autoPersist) {
      this.serializer.save()
    }    
  }
}