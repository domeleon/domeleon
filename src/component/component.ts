import type { UpdateEvent } from './componentTypes.js'
import type { VElement } from '../dom/dom.js'
import type { Route } from '../router/route.js'
import type { Action } from '../router/history.js'
import type { ValidatorError } from '../form/validationTypes.js'
import { div } from '../dom/htmlGenElements.js'
import { ComponentContext } from './componentContext.js'
import { ComponentSerializer } from './componentSerializer.js'
import { freezeProps } from '../util.js'
import { SerializerMap as SerializerMap } from './serializerMap.js'

/**
 * Base class for all Domeleon components.
 * Components are model-first, meaning their data structure and logic are fully initialized
 * before any view rendering occurs, and exist independently of the DOM.
 */
export abstract class Component { 
  /** 
   * The ComponentContext manages the component's status in the component tree.
   */
  ctx = new ComponentContext(this)

  /** 
   * The ComponentSerializer serializes and deserializes the component's state to and from JSON objects.
   */
  serializer = new ComponentSerializer(this)

  constructor() {
    freezeProps(this, ['ctx', 'serializer'])
  }

  /**
   * Implement to return your component's state as a VElement, for example:
   * ```
   * class Component {
   *   count = 1
   *   view () { return div(this.count) }
   * }
   * ```
   * @returns A VElement (virtual DOM element) representing the component's view.
   */
  view(...args: any[]): VElement {    
    return div(this.constructor.name)
  }

  /**
   * Call to trigger an update cycle for the component and the app, after you've modified
   * your component's state.
   * @param event Optional data associated the update.
   */
  update(event?: Partial<UpdateEvent>) {
    this.ctx.update(event)
  }  

  /**
   * Called when the component is attached to its parent and the app - this is a model event;
   * use a VElement's onMounted hook for attachment to the DOM.
   */
  onAttached() {}

  /** Called then the component or any of its descendants have been updated. */
  onUpdated(event: UpdateEvent) { }


  /** Called after the app's view has been rendered. */
  onRendered() {}

  /**
   * Use to return custom, asynchronous validation errors, to be used in concert with a
   * component that has a `validator` property that derives from `Validator`,
   * such as `ZodValidator`.
   */
  async onValidate(): Promise<ValidatorError[]> { return [] }

  /**
   * Called before navigation occurs, for components that implement IRouted as follows:
   * ```
   * class Component {
   *   router:Router = new Router(this)
   *   routeSegment = "my-route"
   * }
   * ```
   * 
   * `onNavigate` executes when `routeSegment` matches the incoming path. Use it to:
   * 
   * 1. Initialize any child components *before* they are navigated to, each with a
   * matching `routeSegment`.
   * 2. Optionally return `false`, to block the navigation occuring.
   */
  async onNavigate (relativeRoute: Route, action?: Action) : Promise<boolean|void> { }   

  /**
   * Called *after* a component has been navigated to.
   * Used in concert with a component that has a router property of type Router.
  */
  onNavigated () { }

  /**
   * Implement to map properties to classes, so that the deserializer can turn plain objects into classes.
   * Useful for properties that can be undefined or empty arrays, hence lack a runtime type. Use `null` to omit
   * properties during serialization/deserialization.
   * E.g.
   * ```
   * class MyComponent extends Component {
   *   items? Item[]          // runtime type can be undefined or empty array
   *   created?: Date         // runtime type can be undefined
   *   picker = new Picker()  // runtime type is known but we don't want to serialize it
   * 
   *   serializerMap = SerializerMap<MyComponent> = {
   *     items: [Item]
   *     created: Date,
   *     picker: null // an alternative to prefixing property with `_` or `#`; useful for sub-components that you don't want to serialize
   *   }
   * }
   * ```
   */
  serializerMap: SerializerMap<any> = {}
}