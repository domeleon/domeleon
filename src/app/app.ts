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
  root: Component,
  id: string,
  renderer?: Renderer<any>    
  cssAdapter?: CssAdapter
  routeService?: RouteService
  autoPersist?: boolean
  plugins?: AppPlugin<any>[]
}

class App implements IApp {
  private _lock = false
  private _pending = false  
  readonly serializer: AppSerializer
  readonly renderer: Renderer<any>   
  readonly routeService: RouteService
  private readonly _root: Component    
  private readonly _props: AppSetupProps
  private readonly _rootElement: Element | null = null  
  private readonly _id: string
  private readonly _saveDebounce: () => void   
  private readonly _plugins: AppPlugins

  constructor (props: AppSetupProps) {
    this._id = props.id
    this._root = props.root
    this._props = props
    this.renderer = props.renderer ?? createDefaultRenderer()
    this._rootElement = document.getElementById(props.id)    
    this._saveDebounce = debounce(() => this.save(), 200)

    this.serializer = new AppSerializer({
      id: props.id,
      root: this._root,
      refresh: () => this.render(),
      autoPersist: props.autoPersist ?? false
    })    
    
    this.routeService = props.routeService ?? new RouteService()
    this.routeService.init(this) 
    this._root.ctx.attach(this)
    this._plugins = new AppPlugins(this, props.plugins ?? [])
    this.render()
  }

  get containerId() { return this._id }  

  get root(): Component { return this._root }

  private render() {
    if (this._lock) {
      this._pending = true
      return
    }
    this._lock = true
    this._pending = false    
        
    requestAnimationFrame(async () => {   
      try {   
        const vNode = this._root.view()      
        await cssManager.flushClasses(this._props.cssAdapter)
        this.renderer.patch(vNode, this._rootElement!)
        this.root.ctx.markRendered()
        this._plugins.onRendered()
      }
      finally {
        this._lock = false
        if (this._pending) {
          this._pending = false
          this.render()
        }
      }
    })
  }

  update(event: UpdateEvent) {      
    if (! this.serializer || ! this._plugins)
      return
    this._plugins.onUpdated(event)
    this._saveDebounce()
    this.render()
  }

  private save() {    
    if (this._props.autoPersist) {
      this.serializer.save()
    }    
  }
}

/** Mounts your Domeleon `root` component on a DOM element with the given `id`. */
export function app (props: AppSetupProps) : IApp {
  return new App(props)
}