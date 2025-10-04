import { Component } from './component.js'
import { keysOfComponent, isKeyOfComponent, serializedKeys } from './componentSerializer.js'
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
    this.attachInternal(app, this.parent)
  }

  private attachInternal(app: IApp, parent?: Component, deserialized = false): void {
    this._app = app
    this._parent = parent
    for (const child of this.children)
      child.ctx.attachInternal(app, this.component, false)
  
    if (deserialized) this.traversePostOrder(c => c.onDeserialized())

    this.traversePreOrder(c => {
      if (c.ctx.state === "detached") {
        c.ctx._state = "updating"
        c.onAttached()
      }
    })
  }

  /**
   * Ensures child components are attached, propagates updates to ancestors,
   * then triggers an app render.
   */
  update(event?: Partial<UpdateEvent>) {
    if (this.app)
      this.attachInternal(this.app, this.parent, event?.cause === "serializer")  
  
    if (this.state === "rendered")
      this._state = "updating"

    const sourcedEvent = <UpdateEvent>{ ...event, component: this.component }
    for (const comp of this.rootToHere.reverse())
      comp.onUpdated(sourcedEvent)

    this._app?.update(sourcedEvent)
  }

  /** Performs a pre-order traversal (parent first) of the component tree. */
  traversePreOrder(action: (component: Component) => void, visited: Set<Component> = new Set): void {
    this.throwOnDupe(visited)
    action(this.component)
    for (const child of this.children) child.ctx.traversePreOrder(action, visited)
  }
  
  /** Performs a post-order traversal (children first) of the component tree. */
  traversePostOrder(action: (component: Component) => void, visited: Set<Component> = new Set): void {
    this.throwOnDupe(visited)
    for (const child of this.children) child.ctx.traversePostOrder(action, visited)
    action(this.component)
  }

  /** @internal */
  markRendered(): void {
    this.traversePreOrder(c => { 
      c.ctx._state = "rendered"
      c.onRendered()
    })
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
    return keysOfComponent(this.component).flatMap(key => {
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
   * Returns all the properties that partake in the updatable component tree, consisting of
   * read/write properties not starting with `_` (which are considered private).
  */
  get keys(): string[] {
    return keysOfComponent(this.component) 
  }

  /** Returns keys that will be serialized, which are `keys` further filtered by `serializerMap[key] === null`. */
  get keysSerialized(): string[] {
    return serializedKeys(this.component)
  }

  private throwOnDupe(visited: Set<Component>): void {
    if (visited.has(this.component)) {
      const path = this.rootToHere
        .map(c => `${c.constructor.name}-${c.ctx.componentId}`)
        .join(' -> ')
      throw new Error(
        `Component graph invariant violated: duplicate reference or cycle at ` +
        `Path: ${path}\n` +
        `Hint: use a get-only property or a private field (_ or #) for back references.`
      )
    }
    visited.add(this.component)
  }
      
  /** Returns keys that are also components. */
  childrenKeys(): string[] {
    return keysOfComponent(this.component)
      .filter(k => (this.component as any)[k] instanceof Component)
  }

  /** Returns a child component by key, if the child is a field of this context's component. */
  childByKey(key: string) : Component | undefined {
    if (!isKeyOfComponent(this.component, key)) return undefined
    const c = (this.component as any)[key]
    return c instanceof Component ? c : undefined
  }

  /** Returns the field name of the component, if the component is a field of this context's component. */
  childKey(component: Component) : string | undefined {
    return keysOfComponent(this.component)
      .find(k => (this.component as any)[k] === component)
  }
}