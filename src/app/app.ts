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

/**
 * Configures your Domeleon app.
 */
export interface AppSetupProps {
  /** The root component of your app. */
  root: Component,
  /** The `id` of the DOM element to mount the root component on. */
  id: string,
  /**
   * Renderer to use for the app.
   * Defaults to Domeleon's `PreactRenderer`.
   * You may specify `ReactRenderer` or `VueRenderer` imported from `domeleon/react` or `domeleon/vue`.
   */
  renderer?: Renderer<any>,
  /**
   * CSS adapter to use for the app, used for pluggable CSS-in-JS or utility class workflows.
   * For example, specify `themeMgr.unoCssAdapter`.
   */
  cssAdapter?: CssAdapter,
  /**
   * Custom route service for the app; useful for setting a base path, e.g. `new RouteService({ basePath: "admin" })`.
   */
  routeService?: RouteService,
  /**
   * Whether to automatically persist the app's state to local storage (useful for development when hot reloading).
   */
  autoPersist?: boolean,
  /**
   * Plugins to use for the app, e.g. `[inspector]` imported from `domeleon/inspector`.
   */
  plugins?: AppPlugin<any>[]
}

/** Manages the lifecycle of your Domeleon app. */
export class App implements IApp {
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

  /**
   * Configures and mounts your Domeleon `root` component on a DOM element with the given `id`.
   */
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