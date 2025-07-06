import { Component } from './component.js'
import { dataKeys, isDataKey } from './componentSerializer.js'
import { type IApp, type UpdateEvent, type ComponentState } from './componentTypes.js'

export class ComponentContext {      
  private _app?: IApp
  private _parent?: Component
  private _state: ComponentState = "detached"  
  private readonly _component: Component
  private readonly _componentId: number
  private static _globalComponentId = 1

  constructor(component: Component) {
    this._component = component    
    this._componentId = ComponentContext._globalComponentId++    
  }

  /** Returns the component this context manages. */
  get component() { return this._component }

  /** Return either "detached", "updating", or "rendered". */
  get state() { return this._state }  
  
  /** Returns a unique auto-incrementing identifier for the component. Used in form binding. */
  get componentId () { return this._componentId }
  
  /** Returns the parent component, unless this is the root component, which has no parent.. */
  get parent() { return this._parent }

  /** Returns the app that this component is attached to. */
  get app() { return this._app }

  /** @internal */
  attach(app: IApp) {    
    this._attach(app, this.parent, true)
  }
  
  private _attach(app: IApp, parent?: Component, outermost = true) {    
    this._app = app   
    this._parent = parent   
        
    for (const child of this.children) {
      child.ctx._attach(app, this.component, false)
    }

    if (outermost) { this._onAttached() }
  }

  private _onAttached(): void {
    this.traverse(c => {
      if (c.ctx.state === "detached") {
        c.ctx._state = "updating"   
        c.onAttached()
      }      
    })
  }

  /** @internal */
  markRendered(): void {
    this.traverse(c => { 
      c.ctx._state = "rendered"
      c.onRendered()
    })
  }

  /**
   * Ensures child components are attached, propagates updates to ancestors,
   * then triggers an app render.
   */
  update(event?: Partial<UpdateEvent>) {    
    if (this.app) { this._attach(this.app, this.parent) }

    if (this.state == "rendered")
      this._state = "updating"
    const sourcedEvent = <UpdateEvent>{ ...event, component: this.component } 
    for (const comp of this.rootToHere.reverse()) {
      comp.onUpdated(sourcedEvent)
    }
    this._app?.update(sourcedEvent)
  }

  /** The root component of the component tree. */
  get root(): Component | undefined {
    let c: Component | undefined = this.component
    while (c?.ctx?.parent) {
      c = c.ctx.parent
    }
    return c
  }

  /** An array of components from the root to this component. */
  get rootToHere(): Component[] {
    const branch: Component[] = []
    let c: Component | undefined = this.component
    while (c) {
      branch.unshift(c)
      c = c.ctx.parent
    }
    return branch
  }

  /** Returns direct child components, flattening out arrays of components. */
  get children(): Component[] {
    return dataKeys(this.component).flatMap(key => {
      const val = (this.component as any)[key]
      if (val instanceof Component) {
        return [val]
      }
      if (Array.isArray(val)) {
        return val.filter(item => item instanceof Component) as Component[]
      }
      return []
    })
  }

  /**
   * Returns all read/write properties that define the persistable state of the component.
   * Domeleon only serializes data keys, and only data keys show in the Component Inspector.
  */
  get dataKeys(): string[] {
    return dataKeys(this.component) 
  }

  /**
   * Recursively traverses the component tree and applies an action to each component,
   * children first (a pre-order traversal).
   */
  traverse(action: (component: Component) => void, visited: Set<Component> = new Set()): void {
    if (visited.has(this.component)) {
      return
    }
    visited.add(this.component)
    
    action(this.component)
    for (const child of this.children) {
      child.ctx.traverse(action, visited)
    }    
  }
      
  /** Returns properties of the associated component that are also components. */
  childrenKeys(): string[] {
    return dataKeys(this.component)
      .filter(k => (this.component as any)[k] instanceof Component)
  }

  /** Returns a child component by key, if the child is a field of this context's component. */
  childByKey(key: string) : Component | undefined {
    if (!isDataKey(this.component, key)) return undefined
    const c = (this.component as any)[key]
    return c instanceof Component ? c : undefined
  }

  /** Returns the field name of the component, if the components is a field of this context's component. */
  childKey(component: Component) : string | undefined {
    return dataKeys(this.component)
      .find(k => (this.component as any)[k] === component)
  }
}