# Domeleon

Build web UIs with classes encapsulating your domain model and a pluggable Preact/React/Vue VDOM.

## Installation

### npm
```bash
npm install domeleon
```
## Topics

* [Installation](#installation)
  * [npm](#npm)
* [Features](#features)
* [Architecture](#architecture)
* [First Code Sample](#first-code-sample)
* [Examples / Real World Usage](#examples--real-world-usage)
* [Components](#components)
  * [Component Initialization](#component-initialization)
  * [Updates](#updates)
  * [Views](#views)
* [HTML Helpers](#html-helpers)
  * [`class` and `style`](#class-and-style)
  * [Event Handlers](#event-handlers)
  * [`onMounted` callback](#onmounted-callback)
  * [DOM Keys](#dom-keys)
* [Forms](#forms)
  * [Raw Input Layer (lowest `h` layer)](#raw-input-layer-lowest-h-layer)
  * [InputXXX Layer (databinding layer)](#inputxxx-layer-databinding-layer)
  * [formField](#formfield)
  * [Writing a `formField` wrapper](#writing-a-formfield-wrapper)
  * [Labels and Descriptions](#labels-and-descriptions)
* [Validation](#validation)
  * [Async Validation](#async-validation)
  * [`validator.state`](#validatorstate)
* [Unocss & Theming](#unocss--theming)
  * [Canonical Usage](#canonical-usage)
  * [Benefits](#benefits)
  * [Setting Up a Theme](#setting-up-a-theme)
  * [Multiple Themes](#multiple-themes)
  * [Dynamically Changing Themes](#dynamically-changing-themes)
  * [Imports and `App` Setup](#imports-and-app-setup)
  * [Bypassing UnoCss Shortcuts](#bypassing-unocss-shortcuts)
  * [Global Styles](#global-styles)
  * [`CssVar`—Advanced Usage](#cssvaradvanced-usage)
  * [Transparency / Alpha / Opacity](#transparency--alpha--opacity)
  * [Dynamic Styling](#dynamic-styling)
* [Routing](#routing)
  * [Navigation](#navigation)
  * [Root router](#root-router)
  * [Intercepting Navigation](#intercepting-navigation)
  * [Cancelling/Guarding Navigation](#cancellingguarding-navigation)
  * [Preparing Child Routes](#preparing-child-routes)
  * [Navigation Links](#navigation-links)
  * [Transparent Routes](#transparent-routes)
  * [RouteService](#routeservice)
* [Serialization](#serialization)
  * [ctx.keys and serializer.keys properties](#ctxkeys-and-serializerkeys-properties)
  * [Serialization API](#serialization-api)
  * [`App.autoPersist`](#appautopersist)
  * [Deserializing classes (and dates)](#deserializing-classes-and-dates)
  * [onDeserialized event](#ondeserialized-event)
  * [Handling Sets and Maps](#handling-sets-and-maps)
* [App](#app)
  * [`autoPersist`](#autopersist)
  * [Global App Handle](#global-app-handle)
* [Pluggable VDOM - React/Vue/Preact](#pluggable-vdom---reactvuepreact)
  * [`with*` Attributes](#with-attributes)
  * [Choosing a Renderer](#choosing-a-renderer)
  * [Be Agnostic When you Can](#be-agnostic-when-you-can)
* [Inspector](#inspector)
* [Maskito](#maskito)
* [Component Communication](#component-communication)
  * [Child-To-Parent Communication](#child-to-parent-communication)
  * [Component to Non-Component Communication](#component-to-non-component-communication)

## Features

* **Pluggable VDOM rendering engines**:
  * Preact (default)
  * React
  * Vue
* **Modular add-ons**:
  * `unocss` for succinct css w/ a type safe theme manager
  * `zod` for validation
  * `maskito` for masked inputs
  * `inspector` to monitor your component's state & updates
* **Core**:
  * Serializer - serialize component state to the server or local storage
  * Router - composable router integrated with component model
  * Forms - ARIA, validation, structure uniform & friendly across varied CSS

## Architecture

The heart of your Domeleon app is your object model: classes encapsulating the state of your domain model instead of wrapping DOM elements. So long as your classes imply a tree from their public writable properties, Domeleon can reason about that tree. Most notably, transforming that tree into a view or serializing it to the server or local storage.

Simplicity guides the architecture:

  * Views use **functional** style:
    * because **views are simpler when stateless**
  * Components use **OO** style:
    * because **encapsulation simplifies reasoning about state**
  * HTML/CSS use **TypeScript** (also works with Javascript):
    * because **it's simpler to code in one high level language**

## First Code Sample

Here's a Counter component in Domeleon. It assumes an HTML page with `<div id="app">`.

```typescript
  import { App, Component, div, button } from 'domeleon'

  class Counter extends Component {
    count = 0

    view() {
      return div(
        button({ onClick: () => this.add()}, '+'),
        this.count
      )
    }

    add() {
      this.count++
      this.update()
    }
  }

new App({ root: new Counter(), id: 'app' })
```

Application state lives in your components — in this case `count`.

Components optionally implement a `view` method, but since they represent your domain model, rather than a wrapper around a DOM element, you can have multiple views, e.g. `summaryView` or `detailView`. A view is a pure non-side-effecting function of the `Component`'s state returning an immutable `VElement`.

Components update their state via their `update` method, which triggers a re-render of the root component's `view`. Features like databinding, routing, and serialization, all automatically call `update` for you, which you can monitor with domeleon's `inspector` module.

## Examples / Real World Usage

Numerous examples here:
https://typebulb.com

Typebulb runs apps in markdown files called bulbs, perfect for tools, visualizations & experiments. Many of the bulbs are written in domeleon, and typebulb.com itself is itself written in Domeleon too.

## Components

Derive from the `Component` class to encapsulate part of your domain model. Then build out a tree of components to structure your application. Here, we build upon our introductory example, by composing two smaller components into a new component:

```ts
import { Component, div } from 'domeleon'
import { Counter } from './counter'

export class TwinCounters extends Component {
  counter1 = new Counter()
  counter2 = new Counter()

  view() {
    return div(
      this.counter1.view(), // Call child's view method
      this.counter2.view()
    )
  }
}
```
>💡**Component != DOM Element**  
> A component encapsulates a piece of application state, **not** a DOM element.

You can also specify arrays of components. Here's the structure of a recursive tree component:

```ts
import { Component } from 'domeleon'

export class Tree extends Component
{    
  trees: Tree[] = []
  ...
}
```
Let's flesh this out:

* add and remove components
* enable serialization so it roundtrips & our component state hot-reloads
* add a visualisation of each node.

```ts
import { Component, button, div, VElement, SerializerMap } from 'domeleon'

export class Tree extends SampleComponent {
  serializerMap: SerializerMap<SampleComponent> = { trees: [Tree] } // optional, for derialization
  trees: Tree[] = []

  add() {
    this.trees.push(new Tree())
    this.update()
  }

  remove() {
    this.trees.pop()
    this.update()
  }

  view(): VElement {
    return div({ style: { paddingLeft: `${this.ctx.rootToHere.length * 10}px` } },
      this.ctx.componentId,
      button({ onClick: () => this.add() }, "add"),
      this.trees.length ?
        button({ onClick: () => this.remove() }, "remove") :
        undefined,
      this.trees.map(c => c.view())
    )
  }
}
```

The `serializerMap` field enables our tree's children to be successfully deserialized. It's a simple map to deserialize the raw incoming json objects into classes.

> **💡Deep Dive**: Every component is assigned an auto-incrementing unique `componentId` at construction, accessible via its `ctx` property. It's used by `formField` to automatically assign labels to inputs with unique ids, so you never need to. You rarely actually use it explicitly like we did in this example, but it's informative in understanding how domeleon works.

### Component Initialization

#### Construction
Your component is simply a class instance, so its life begins with a constructor call.

#### `onAttached`

The `onAttached` method is called after your component has its `ctx.app` and `ctx.parent` property set.

```ts
   override onAttached () {
       // Perform setup, e.g.: // start subscriptions, fetch data
   }
```

The `onAttached` method is **guaranteed** to be called:

* once per component attached to the component tree
* *synchronously*, after an update (or app start) made it accessible from the root component
* *before* the next render
* *after every* component in the component tree for that update (or app start) has had its `parent` and `child` properties set
* before `onAttached` is called on its children

>**Tip**: The `onNavigate` method is often used in tandem with `onAttached` to build out your component model. It's particulary useful for asynchronously fetching data from the server upon navigation.

### Updates

The primary function of `update` is to trigger a re-render of the `app`. As we saw earlier:

```ts
  add (x: number) {
    this.count += x
    this.update()
  }
```
Specifically, `update` triggers:

* `onUpdated` on the component and each ancestor up to the root
* a save, if `autoPersist` is enabled
* a re-render of the app

By far the most expensive part of on update cycle is changes to the *DOM*. Since Domeleon runs atop state-of-the-art virtual DOMs, these operations are extremely fast and reliable.

>**Tip:** Use the domeleon inspector to live view all updates to your component tree. It's helps understand the model.

>**Tip:** In certain exceptional circumstances, such as a complex custom animations, postpone calling `update`. This is exactly how the Mandelbrot Explorer written with Domeleon works while zooming, as each calculation needs to run within 16ms! Domeleon lets you be pragmatic.

### Views

Views are pure functions of component state: each component's view returns an extremely light-weight immutable `VElement` tree.

The app's chosen `renderer` takes this tree and translates it into the specific VDOM nodes (e.g., Preact, Vue, or React nodes) used by the underlying renderer, which then patches the VDOM.

`view` methods tend to be parameterless, as components are natural units of encapsulation: they simply render their own state. However, the world isn't perfect! In domeleon, you can add optional parameters to your child components' `view` methods. This can be useful when a child's view needs to render state that makes more sense to live on the parent

Critically, domeleon is model-centric, not view-centric. A domeleon component represents a piece of state, not a piece of HTML. A component might be viewless or have multiple methods returning different `VElement`s. For example:

```ts
  summaryView () {
    return div (...)
  }

  detailView () {
   return div (...)
  }
```

## HTML Helpers

Domeleon provides HTML helper functions (`div`, `span`, `button`, etc.) that create `VElement` objects. These helpers accept attribute objects followed by a spread of child elements or primitive values.

Examples:

```ts
import { div, button } from 'domeleon'

div()                                      // empty <div></div>
div("hello")                               // <div>hello</div>
div({ id: 'my-div' })                      // <div id="my-div"></div>
div({ id: 1, class: "foo" })               // <div id="1" class="foo"></div>
div({ id: 'main' }, "hello")               // <div id="main">hello</div>
div(div({ class: 'inner' }))               // <div><div class="inner"></div></div>
div({ id: 'combo' }, "hello", div("bye"))  // <div id="combo">hello<div>bye</div></div>

button({ onClick: () => console.log('clicked') }, "Click Me") // <button>Click Me</button>
```
Internally, `div`, `button` etc. just call the `h` function, passing in the element name.

### `class` and `style`

Domeleon treats these properties specially:

* `class` may be a `string` or `string[]`
* `class` preprocesses **utility** classes (e.g. converts " " to "_")
* `style` *only* takes an *object*, not a `string`
* `class` and `style` properties are merged correctly when passing multiple attribute objects to an `h` function.

For example, the following 3 statements are all equivalent:

```ts
div({class: "x y" })
div({class: ["x", "y"] })
div({class: "x"}, { class: "y" }
```

Import `mergeAttrs` should you need to merge attribute objects outside the context of an `h` function.

### Event Handlers

Event handlers are specified directly in attribute objects:
```ts
button({ onClick: () => this.add(1) }, "+")
```

JavaScript's `this` binding requires care. Follow these patterns within Domeleon components:

1.  **Wrap callbacks in closures:** To preserve the correct `this` context.
```ts
    // CORRECT - this will guarantee the correct `this` pointer reference
    button({ onClick: e => this.handleClick(e) }, "Click")
    
    // WRONG - this can lose the *this* pointer reference
    button({ onClick: this.handleClick }, "Click")
```

Domeleon always expects `camelCase`, from events through to aria attributes. Each vdom specific renderer automatically transforms the casing appropriately (e.g. to kebab-casing etc.).

### `onMounted` callback

The vast majority of your code won't need to touch the DOM; you simply output vdom nodes, and let the renderer patch your changes automatically.

However, sometimes you need direct access to DOM elements. It might be useful for focus management, integrating 3rd-party libraries that operate on a DOM element, or drawing on a canvas.

We can use the `onMounted` event on an attribute, to obtain a reference to a DOM element:

```ts
import { Component, VElement, canvas } from 'domeleon'

export class Paint extends Component {
  view() {
    return canvas({
      width: 150,
      height: 150,
      onMounted: elm => {    
        const canvas = element as HTMLCanvasElement
      }
    })
  }
}
```
You can optional return a callback that is called when the element is unmounted.

### DOM Keys

After each update, the virtual DOM is patched. The patcher compares the current virtual DOM tree to the previous one, and modifies the real DOM accordingly. However, the patching algorithm can't know your intent, and so occassionally does the wrong thing. It may try to reuse an element that you definitely want to replace, or it may try to replace a list of child elements that you merely wanted to reorder. To better declare your intent, provide keys for your virtual DOM nodes. For example:

```ts
div ({key: wizardPage})
```
If the key changes, the patcher now knows to definitely recreate that DOM element. This means even if your next wizard page happened to have an input that could have been updated, that instead it will be replaced, predictably resetting DOM state like focus and selections, and invoking any animations that should occur on element creation.

## Forms

Domeleon lets you choose 4 increasing layers of abstraction when building forms, to suit your needs:

| Layer | Description | API |
|-------|-------------|----------|
| Raw Input | Thin wrappers around the `h` function returning a `VElement` | `input`, `select`
| `inputXXX` | Functions that databind to your components | `inputText`, `inputTextArea`, `inputSelect`, `inputRange`, `inputNumber` (via maskito), `inputMask` (via maskito), `inputCheckbox`, `inputRadioGroup`, `inputCheckboxGroup` |
| `formField` | Takes an `inputXXX` function and automatically outputs standardized vdom elements with: labelling/description, validation, aria attributes, id generation, structural compatibility with major css frameworks | `formField` |
| `formField` wrapper | Your own helpers that wrap `formField` for consistent styling throughout your application. | `myFormField`
   
> 💡**Note**: By design, Domeleon **never** outputs css classes; this is entirely handled in your application layer. For example, you set the class on the `validationAttrs` property of `formField`; domeleon is 100% not prescriptive here.

### Raw Input Layer (lowest `h` layer)

This is simply directly using the standard auto-generated `h` wrappers based on the HTML spec:
```ts
input ({id: "foo", value: "name": onInput: () => { ... } })
```
### InputXXX Layer (databinding layer)

The following functions are abstraction of the raw input layer, to handle databinding for you:

* `inputText`
* `inputTextArea`
* `inputSelect`  
* `inputRange` 
* `inputNumber` // maskito
* `inputMask` // maskito
* `inputCheckbox`
* `inputRadioGroup`
* `inputCheckboxGroup`

You can use these `inputXxx` functions directly, or you can merely pass the function into `formField` as the `inputFn`. Here's using one directly:

```ts
export class Form extends Component {
  country = `UA`

  view () {
    return inputSelect({
      target: this,
      prop: () => this.country,
      options: [
        {value: "UA", label: "Ukraine"},
        {value: "GE", label: "Georgia"}
      ]  
    })
  }
}
```

Every `inputXxx` function takes a `target` and `prop` value, to perform the databinding. Some `inputXxx` functions take additional arguments, such as `inputSelect` that takes an array of `options`.

### formField

Here's how we could use an input function with `formField`. Note that in a typical app we'd probably write a reusable formField, to minimise boilerplate, as we'll see later.

```ts
import { Component, div } from 'domeleon';

export class Form extends Component {
  country = `UA`
  view () {
    return formField({
      target: this
      prop: () => this.country,
      inputFn: inputSelect,
      inputProps: {
        options: [
          {value: "UA", label: "Ukraine"},
          {value: "GE", label: "Georgia"}
        ] 
      }
    })
  }
}
```
The `inputProps` simply passes through the properties to `inputFn`.

So why use `formField` rather than just directly use an `inputXxx` function?

`formField` will **automatically**:

* include a human readable label and/or description, either driven by the component's field name by default, or by the `getLabel` method if implemented on the component
* asssign unique `id`s for the label and descriptions to work properly (using `component.ctx.qualify(prop)`).
* output aria attributes
* if validation is enabled, output validation errors
* include a ubiqituous element structure compatible with all major css frameworks

Swapping from bootstrap to unocss? Your form fields stay the same: just update the css classes you feed them. `formField` helps you deeply separate the concerns of your form's data vs. presentation.

### Writing a `formField` wrapper

It's common to write a wrapper for `formField`, for consistent styling across your app. Your usage can look like this:

```typescript
  appFormField ({
    target: this,
    prop: () => this.country
  )
```

Where you've defined a reusuable `appFormField`. Here is where you can set every facet of the `formField`, to precisely control the styling.

```typescript
type SupportedInputFn = typeof inputText | typeof inputNumber | typeof inputMask

const appFormField = (props: FormFieldInputProps<SupportedInputFn>) => 
  return formField({
    ...props,
    // common customization
    fieldAttrs: { class: styles.field }, // div wrapping entire field
    descriptionAttrs: { class: styles.description },
    validationAttrs: { class: styles.error } // e.g. red    
  })
```
`formField` always provides a unified structure, regardless of whether we're using text inputs, select inputs, or radio buttons:

* `target` // the component to databind to
* `prop` // the property on the component to databind to, expressed in a type safe manner
* `inputFn` // the name of the input function, e.g. `inputText` or `inputSelect`
* `inputProps` // the props the `inputFn` expects.

### Labels and Descriptions

#### Default Labels

By default, `formField` automatically generates a label name by converting `yourProperty` to `Your Property` using the `humanizeIdentifer` function. It translates like this:

* `yourPropertyName` -> `Your Property Name`

#### `getLabels`

If you need more control, or a more metadata driven approach, you can implement the `getLabels` function. This will automatically be picked up by `formField` when setting the `label` and `description` properties. Use as follows:

```ts
export class MySample extends Component {
  username: string
  bonus: number

  getLabels() {
    return {
      username: { label: "What's your name?", description: "Nick names are ok!" },
      bonus: "Annual Bonus"  
    }
  }
```
You can specify either just a `string` for label, or an object, if you wish to provide both a `label` and a `description`.

The `description` text by default appears below your input, and is swapped out by a validation message, if a validation error occurs.

#### Explicitly Setting `label` and `description`

For maximum control, explicitly set the `label` and `description` values directly when calling `formField.` Here you can set arbtirary HTML rather than just strings. For example:

```ts
    return formField({ 
      target: this,
      prop: () => this.subscribeToNewsletter, 
      inputFn: inputCheckbox,
      label: "Subscribe To Newsletter"
      description: span({/* styles here */}, "Exclusive content!")
    })
```

## Validation

Domeleon can integrate with validation libraries like `zod` or `class-validator`. The dedicated `domeleon/zod` package provides out of the box support for `zod`. `zod` has a very nice chained model for incrementally refining permissable values.

Suppose we define this `zod` schema:

```ts
const schema = z.object({
  username : z.string().min(3).endsWith("x").max(10).regex(/^[a-z]+$/),
  rating   : z.number().min(0).max(10).optional()
})
```
We can use it as follows:

```ts
export class MySample extends SampleComponent implements IValidated, z.infer<typeof schema>
{
  validator: Validator = new ZodValidator(this, schema)

  username!: string
  rating?: number

  submit () {
    this.validator.validate()
    ...
  }

  override onUpdated(event: UpdateEvent) {   
    this.validator.revalidate(event)
  }

 view () {
   return div (
     formField({
      target: this
      prop: () => this.usernmae,
      inputFn: inputText
    }),
    button({ onClick: () => this.submit()})
    ... // define other formField etc.
  }
}
```

Let's break this down:

* `Validator` is a domeleon base class that orchtestrates validating your components
  * Recursively validates your components by calling `validateSync` on each validator
  * Triggers `onValidate` on your component, to handle custom asynchronous validations
  * Collates all the validations per property, and maintains an overall validation `state`
 * `ZodValidator` implements `validateSync` to validate your component's properties with your `Zod` schema

The `onUpdated` override gives incremental feedback to the user, by revalidating the component, as they adjust their form.

### Async Validation

We can also provide custom async validation via overriding the `onValidate` method. This is useful for asynchronous valdation, or validation that applies to the form as a whole, rather than a particular property.

For example:

```ts

  override async onValidate() {
    const result = await ...    // call server here
    if (this.username == ...) { // check if username is unique
      return []                 // no validation errors
    }
    return [{
      property: 'username',
      messages: ['Username is not unique'],
      value: this.username
    }]
  }
```
Your component will receive two validation update events, first a synchronous one, to immediately give feedback to your users, followed by the asynchronous one.

### `validator.state`

A `validator`'s `state` is of type `ValidationState`:

```ts
"unvalidated" | // yet to be valiated
"validating" |  // in the process of validation, no validation failed yet
"invalid" |     // at least one synchronous or asynchronous validation failed
"valid"         // determine valid, all async validatio complete
```

> `validator.state` is especially highlighted in the `inspector`.

## Unocss & Theming

You can use whatever CSS framework you want with Domeleon. However, Domeleon has a specific add-on for `unocss` that provides a theme manager that allows you to express type-safe, terse, css code.

### Canonical Usage

For example, here's styling for a tab component:

```ts
const tabStyles = themeMgr.styles("tab", theme => {
  const { textPrimary, bgSecondary, bgAccent } = theme.colors

  return {
    active: `text-${textPrimary} border-b-${bgAccent} font-bold`,
    inactive: `text-${bgSecondary} border-b-transparent font-normal`
  }
})
```
Then use styles with guaranteed type safety as follows:

```ts
  view() {
    div ({class: tabStyles.active }, ...)
  }
```
### Benefits

For most apps, using domeleon's unocss theme manager will save you time:

* Effortlessly find or rename all usages of any specifc css variable, e.g. `bgSecondary`, throughout your entire app
  * Confidently delete unused styles
* Class names are semantically named and scoped, such as `app-tab-active`:
  * Zero collisions, short, & human radable
  * The prefix, such as `tab` above, is optional. So `themeMgr.styles(theme => { ...})` is also ok
* Frictionless switching between custom themes, e.g. light vs dark
* Choose whatever organisation keeps your css code maintainable:
  1. Colocate styles with components
  2. Keep styles in their own file

### Setting Up a Theme

Here is how you set up a theme:

```ts
const lightTheme = {
  colors: {
    textPrimary: 'rgb(0, 100, 0)',
    bgPrimary: 'rgb(220, 220, 220)',
    pianoRoll: {
      barLine: '#808080',  // both rgb & hex OK
      barLabel: '#ffffff'
    }
  }
}

export const themeMgr = new UnoThemeManager({
  id: 'app',  
  themes: { light: new LightTheme() },
  unoCssConfig: { presets: [presetWind3()] }
})
```

### Multiple Themes

It's easy to add multiple themes. Here's adding a dark theme:

```ts
const darkTheme = {
  colors = {
    textPrimary: 'rgb(0, 200, 0)',
    bgPrimary: 'rgb(50, 50, 50)',
    pianoRoll: {
      barLine: '#808080',
      barLabel: '#000000'
    }
  }
}
```

Where we now add both the `light` and `dark` themes to our theme manager:

```ts
  themes: {
    light: new LightTheme(),
    dark: new DarkTheme()
  }
```
### Dynamically Changing Themes

You simply set the `themeName` of your theme manager whenever you want to change themes, at runtime. Or you can configure it based on your users preference as follows:

```ts
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches  

export const themeMgr = new UnoThemeManager({
  ...  
  initialTheme: isDark ? 'dark' : 'light',
})
```

### Imports and `App` Setup

You'll need to pick an unocss preset, then use the `UnoThemeManager` and `ThemeProxy` for domeleon, as follows:

```ts
import presetWind3 from '@unocss/preset-wind3'
import { UnoThemeManager, type ThemeProxy } from 'domeleon/unocss'
```
Make sure to specify your theme manager's `cssAdapter` in your app:

```ts
new App({
  ...
  cssAdapter: themeMgr.unoCssAdapter  
})
```
This guarantees any fresh `class` properties on your `VElement` (`div`, `span` etc.) are sent through to the adapter just before each VDOM patch, with no FOUC (Flash of Unstyled Content).

### Bypassing UnoCss Shortcuts

`themeMgr.styles` internally leverages unocss shortcuts, which means you get clean, short, semantically named class properties in your css. You can however, directly use utility styles on `class` properties if you wish. You can even reference your theme manager's styles and it will work fine. For example:

```ts
  div({ class: `text-${bgSecondary} border-b-transparent font-normal`})
```

### Global Styles

#### globalUnoCss

Sometimes you need to specify styles *globally*, such as wanting your links to look a particular way across your entire application. You define them with a `globalUnoCss` definition:

```ts
const globalUnoCss = (theme: ThemeProxy<MotifnTheme>) => {
  const { textPrimary, primaryHover, backgroundPrimary, textSecondary, } = theme.colors
  return {
    'a': `text-${textPrimary} no-underline`,
    'a:hover': `text-${primaryHover}`,
    'h1': `m-0 text-${textPrimary}`,
    'body': `m-0 bg-${backgroundPrimary} text-${textSecondary} font-sans antialiased`
  }
}

export const themeMgr = new UnoThemeManager({
  ...
  globalUnoCss
})
```

Be judicious with global styles; in most cases you don't need them.

#### globalRawCss

Sometimes you'll want to define raw css, not unocss utility strings. This is useful in certain cases, such as for keyframe animations. You define them with a `globalRawCss` definition:

```ts
const globalRawCss = (theme: ThemeProxy<MotifnTheme>) => {
  const { highlightAnimateStart, highlight } = theme.colors
  return `
    @keyframes nowStroke {
      0%   { stroke: ${highlightAnimateStart.css}; }
      100% { stroke: ${highlight.css}; }
    }
    @keyframes nowFill {
      0%   { fill: ${highlightAnimateStart.css}; }
      100% { fill: ${highlight.css}; }
    }
    .now { animation: nowStroke 0.5s linear; }
    .now-note-label { animation: nowFill 0.5s linear; }
  `
}

export const themeMgr = new UnoThemeManager({
  ...
  globalRawCss
})
```
Once these global styles are defined, you can refer to them into your ordinary unocss styles.

### `CssVar`—Advanced Usage

You almost always use theme properties such as `textPrimary` within a string literal. This means its `toString` method is called, that simply returns its `name`, for `unocss` usage.

Its type is `CssVar` which has other properties that are occasionally useful if you need to work at lower layer, as we did when using `globalRawCss`. For example:

```
name:        textPrimary
cssVarName:  --app-colors-text-primary
css:         rgb(var(--app-colors-text-primary))
rawValue:    rgb(0, 200, 0)
```
>**Deep Dive**: The proxy generated by the theme manager takes your raw string values and returns `CssVar` values.

### Transparency / Alpha / Opacity

Always separate the alpha values from your colors. For example:

```ts
const lightTheme = {
  colors: {
    textPrimary: 'rgb(0, 100, 0)'    
  },
  // optional: “alphas”, “transparency”, etc.
  alphas: {
    panel: '0.5' // decimal-string between 0–1 (here, 50% opacity)
  }
}
```
Now, to make `textPrimary` 50% transparent, you have two options:

 * Option 1: Simply inline `50` with unocss; this is more common.
 * Option 2: Pass a theme variable to the `alpha` method of a color theme variable.

Both are shown below, yielding the same result:
```ts
const styles = themeMgr.styles("test", theme => {
  const { textPrimary } = theme.colors
  const { panel } = theme.alphas

  return {
    option1: `text-${textPrimary}}/50`
    option2: `text-${textPrimary.alpha(panel)}`...
  }
})
```
Using an alpha theme variable is useful if your transparency value diverges per theme.

### Dynamic Styling

Domeleon's `unocss` add-on computes **all** styles ar runtime, not build time. Why?

* The underlying `unocss` library is *incredibly* fast, even for the first render.
* Even the presets are fairly small in kb.
* No build step = ultra simple deployment.
* Domeleon has deep integration, bypassing any FOUC issues.

#### Sticky Situation—Advanced Usage

One issue with dynamically generated styles, is occassionally you can build up too many styles in the head of your document. However, there's an escape hatch.

The `UnoThemeManager` class exposes its `UnoCssAdapter`:

* By default its `stickyMode` is `always`, so classes always persist across renders.
* If you set `stickyMode` to `explicit` then only classes passed through the `stickyClass` function perist across renders. Import and use `stickyClass` for special cases like animation, where you need to guarantee classes "stick" around.

You can also call the `UnoCssAdapter`'s `clearStickyClasses` to force clear the sticky styles.

## Routing

Domeleon provides a composable router, where each `Component` that's routed has its own `router` property, and `routeSegment`:

``` ts
export class Help extends Component
{
  router: Router = new Router(this)  
  routeSegment = "help"
}
```

The Help component will now match the `help` route.

> **💡Route Tree Structure**  
> The route structure mirrors your component tree structure (but skips *transparent* routes).

> **💡Inspect Routes**  
> Domeleon's inspector especially highlights your route structure, and informs you of router update events.

### Navigation

Use the router's `navigate` method with *relative* paths. The below assumes `this` is the `Help` component:

| Code | From | To |
|------|-------------|------------|
| `this.router.navigate('')` | `/help` | `/help` |
| `this.router.navigate('banana')` | `/help` | `/help/banana` |
| `this.router.root.navigate('help/banana')` | `/` | `/help/banana` |
| `this.router.parent.navigate('examples')` | `/help` | `/examples` |

`navigate` takes an optional second argument `action` (`'PUSH' | 'REPLACE'`, default `'PUSH'`). Use `'REPLACE'` to change the URL without adding a history entry — right for modal-like routes (e.g. a fullscreen toggle) where Back should leave the page, not replay the toggle.

Routes are path + query only: `location.hash` is never carried across navigations. This matches React Router and Vue Router; treat fragments as page-scoped state you set yourself after navigating.

### Root router

Each router on your component tree also forms its own router tree. The root of that tree must define a *transparent route* (explained further below), meaning it has an empty `routeSegment`:

```ts
class Index {
  router: Router = new Router(this)
  routeSegment = ""
}
```

>Note that you can define `basePath`, explained further below.

### Intercepting Navigation

Implement your `Component`'s' `onNavigate` for:

*   **Validation/Prevention:** (return `false` to prevent navigation)
*   **Data Fetching:** (await retrieving child components)
*   **Redirection:** (cancel, then navigate elsewhere)

Implement as follows:

```ts
async onNavigate (relativeRoute: Route) {
  if (child.firstSegment == ...) {
    // return false to cancel navigation
  }
  const child = await ... // fetch child
  this.serializer.deserialize ({ child: child})
}
```
You may also implement the synchronous `onNavigated` to react *after* a component becomes active in the route.

#### Route Class
The `Route` object provides a safe, structured view of a route. Access its `segments` or convenient `firstSegment`, that's simply `segments[0]`.

> Never engage in error-prone string manipulation of forward slashes to deal with paths! Use the `Route` class instead.

`firstSegment` is the most common property to use in `onNavigate` as it represents the the immediate relative path, that is intended to match a child component's `routeSegment`.

### Cancelling/Guarding Navigation

Return `false` to cancel/gaurd a navigation; otherwise you don't need to return anything.

If the cancelled navigation came from the browser's Back/Forward button, domeleon restores the address bar to the current route (the browser has already moved it by the time your guard runs).

### Preparing Child Routes

A common pattern is to fetch data on `onNavigate`, so that a child can be navigated to. Domeleon strictly requires an *exact match* based on the `routeSegment`, so dynamic routes require this pattern. Think of it as Just-In-Time routing.

> There's no wildcard matching in Domeleon routes! Why? There must *always* be a `component` that represents the exact *state* of a given route. You can't navigate to `"canteloupe"` unless a component exists with the `routeSegment` with the value `"canteloupe"`.

### Navigation Links

The router has a `link` method that's very useful for creating `<a href="...">` virtual DOM nodes. You simply provide a relative route (as a `string`|`string[]`|`Route`), and `HValues`. For example:

```ts
// Example: Creating a link to the 'banana' tab
this.router.link('banana', 'Go to Banana Tab')
// Renders an <a> tag with appropriate href and an `onClick` handler.
```
### Transparent Routes

Transparent routes are incredibly useful as they relax the strict 1-1 relationship between the component tree and route tree. They allow a component purely to pass through the route. For example, `Sidebar` has a transparent route:

```ts
class Sidebar extends Component {  
  router: Router = new Router(this)
  routeSegment = ""

  help = new Help()
}
```
Transparent routers still receive `onNavigate` and `onNavigated` events. They just don't contribute to the `path`; think of it like parents who leave their kids with their grandparents.

### RouteService

You can explicitly initialize the `RouteService` in the `App` construtor to set of a `basePath`. This will ensure your entire router setup works relatively to that path.

```ts
new App ({
   ...
   routeService: new RouteService { basePath: "admin"}
})
```
By default, a `RouteService` is created for you with an empty `basePath`.

## Serialization

Domeleon's component tree is fully serializable, facilliating hot-reload via persisting to local storage, and transfering objects to and from the server.

### ctx.keys and serializer.keys properties

Domeleon only cares about your Component's *ctx.keys* properties, which are:

* **public**
  * **not** properties starting with `_`
* **read** *and* **write**
  * **not** properties with only a getter
* type is **primitive**, **object**, or **class**
  * **not** functions

You can get the exact set of properties that your component will serialize by calling your component's `serializer.keys` property:

```ts
const keys = this.serializer.keys
```
These are the same as `ctx.keys`, but further filtered by any key set to `null` in your component's `serializerMap` if you choose to set it.

### Serialization API

Every `Component` has a `serializer`:

```ts
class Component {
  serializer: Serializer
  ...
}
```

The Serializer exposes the twin methods `serialize` & `deserialize`, used as follows:

```ts
// turn any component into a JSON object
const snapshot = this.serializer.serialize()

// …later – deserialize the JSON object into our component
this.serializer.deserialize(snapshot)
```
Both work recursively.

### `App.autoPersist`

When an `App` is initialized with `autoPersist: true`, domeleon automatically saves after each `update`, and on loading, restores its state via local storage. It's trivial to set up:

```ts
import { App } from 'domeleon'

new App({
  root : new Master(),
  id : 'app',
  autoPersist : true // save & restore automatically
})
```
Internally, this calls `serialize` and `deserialize` on your root component.

### Deserializing classes (and dates)

Declare a `serializerMap` to map plain json objects to classes:

```ts
export class Tree extends Component {
  serializerMap: SerializerMap<Tree> = {
    setting: Setting   // component
    created: Date      // `Date` special case
    trees  : [Tree],   // array of components
    picker : null      // transient component
  }

  setting: Setting  
  created: Date
  trees: Tree[]
  picker: new Picker()
}
```
The types must be classes (`Date` is also handled). This is necessary because Javascript doesn't actually store runtime type information per property; that's a TypeScript only concept that is destroyed in transpilation.

Specifying a `null` value for a field in `serializerMap` prevents serialization. It's typically a useful alternative to prefixing a `Component` property with `_` or `#` for sub-components that you don't want to serialize, but which you still otherwise want to treat as a `Component` (e.g. partaking in updates etc.)

> **Note**: Domeleon's serializer does **not** use decorators for this purpose, as the latest spec is still not natively implemented by browsers as of 2025.

### onDeserialized event

You can handle `onDeserialized` on your `Component` as follows:

```ts
class MyComponent extends Component {
  onDeserialized() {    
    // e.g. perform validation
    this.throwIfInvalid()
  }
}
```

After the component and its children have been deserialized, `onDeserialized` is called, children first, recursively.

>**Note:** `onDeserialized` has early access to `ctx.parent` and `ctx.app` (when available) enabling contextual validation, even if `onAttached` has yet to be called. `onUpdated` will always be called afterwards.

### Handling Sets and Maps

For simplicity, Domeleon only allows nested components to be single instance values or arrays. This makes Domeleon easy to reason about, as well as providing a direct correspondence with our component tree and the JSON format.

We can however, still use Maps. We just need to make sure our map is:

1. Private
2. If public, only exposed via a read-only property, or simply a method.
3. If serialized, expose publcally as an array.

Here's how we could serialize a `collapseMap`:

```ts
export class InspectorComponentTree extends Component {
  _collapseMap = new Map<string, boolean>()

  get collapseState () {    
    return [...this._collapse]
      .map(
        ([id, collapsed]) =>
        ({id, collapsed})
      )
  }

  set collapseState (state: { id: string; collapsed: boolean }[]) {
    this._collapseMap = new Map(
      state.map(
        ({id, collapsed }) =>
         [id, collapsed]
      )
    )
  }
}
```
This means we get the performance benefits of a `Map`, but can fully partake in the domeleon object model.

>**Design Note:** Domeleon may provide a way to reduce this boilerplate in the future; several designs are possible; still figuring out which one is best. For now this is acceptable.

## App

Your Domeleon application always starts by constructing an `App` instnace.

Here's a minimal setup:

```ts
import { App } from 'domeleon'

new App({ root: new Root(), id: "app"}) // root component + id of element to mount
```
Here's a more advanced setup:

```ts
import { App } from 'domeleon'
import { inspector } from 'domeleon/inspector'
import { themeMgr } from './styles/theme'
import { Master } from './master'
import { VueRenderer } from 'domeleon/vue'

new App({
  root: new Root(), 
  id: "app",
  cssAdapter: themeMgr.unoCssAdapter, // pass .class values through per render
  renderer: new VueRenderer(), // altenatively a ReactRenderer
  autoPersist: true, // auto serialize component tree to local storage
  routeService: new RouteService { basePath: "admin"} // only needed for a custom base path
  plugins: [inspector] // inspect component tree and events
})
```

### `autoPersist`

If true, then your component tree will automatically be serialized to local storage. This can be really nice when developing, as you don't lose your state as you update your source code. However, you may need to add serialization annotations (see [Serialization](#serialization) section).

### Global App Handle

Every `App` self-registers on `window.domeleon.apps`, keyed by mount `id`, and attaches itself to its mount element as `__domeleon_app__`. This is a devtools-style hook (like Vue's `__vue_app__`): `window.domeleon.apps.get('app').root` gives debuggers and agents direct access to the live component tree. Re-mounting on the same id replaces the registry entry.

## Pluggable VDOM - React/Vue/Preact

Domeleon's VDOM is pluggable. The specific VDOM you choose should mostly be an implementation detail; you can write large applications with Domeleon, swap out the VDOM, and not even notice. All 3 VDOMs perform well and are very robust.

By default Domeleon uses Preact, as it's tiny, making it a perfect default. However, you can also use Domeleon with React or Vue, which is useful if you really need to leverage a particular component only available in that framework.

### `with*` Attributes

We can integrate with renderer-specific hooks and components from Preact, React, and Vue, with `with*` attributes.

Here we animate the shuffle using `useAutoAnimate` with preact:

```ts
import { div, button } from 'domeleon'
import { useAutoAnimate } from '@formkit/auto-animate/preact'

export class Shuffler extends SampleComponent {
  items = [1,2,3,4,5]

  view() {    
    return div(
      div({ withPreact: { hook: useAutoAnimate } }, 
        this.items.map(i =>
          div({ key: i }, i)
        )
      ),
      button({ onClick: () => this.shuffle() }, "Shuffle")
    )
  }

  shuffle() {
    this.items.sort(() => Math.random() - 0.5)
    this.update()
  }
}
```
`useAutoAnimate` is a wonderful component, and provides hooks for all 3 frameworks. However, let's swap out our renderer with `Vue` and use Vue's `TransitionGroup` component as follows:

```ts
      div({
        withVue: {
          component: TransitionGroup,
          componentProps: { tag: 'div', name: transitionName }
        }
      },
        this.items.map(i =>
          div({ key: i }, i)
        )
      ),
```
You can even include *both* `withPreact` and `withVue`. If the renderer doesn't match, it's simply ignored.

### Choosing a Renderer

You choose a renderer when you launch your app.

#### Preact / Default

Here's the default, that implicitly uses Preact:

```ts
import { App } from 'domeleon'
import { Root } from './root'
...

new App({root: new Root(), id: "app"})
```
#### Vue

Here's using Vue:

```ts
import { VueRenderer } from 'domeleon/vue'
import { App } from 'domeleon'
import { Root } from './root'

new App({
  root: new Root(),
  id: "app",
  renderer: new VueRenderer()
})
```

#### React

Here's using React:

```ts
import { ReactRenderer } from 'domeleon/react'
import * as React from 'react'
import * as ReactDOMClient from 'react-dom/client'
import { App } from 'domeleon'
import { Root } from './root'
...

new App({
  root: new Root(),
  id: "app", // or "root" if you prefer that for name of the id of the element to mount on
  renderer: new ReactRenderer({ ReactLib: React as any, ReactDOMClientLib: ReactDOMClient })
})
```
React requires separated React and Client libaries that you import yourself, for configurability and versioning robustness.

### Be Agnostic When you Can

Many of the best 3rd party libraries are vendor neutral, and you can use them simply via the `onMounted` hook, that works across all renderers.

## Inspector

The `inspector` is a tool that lets you see your component tree and monitor update events.

Set up the inspector as follows:

```ts
import { App } from 'domeleon'
import { inspector } from 'domeleon/inspector'

new App({
  ...
  plugins: [inspector]
})
```
Components with a `router` property have their routes displayed, making it a great way to get an overview of your routing setup.

The types of update events are:

* router
* validator
* input
* serializer
* custom

`inspector` is itself an application written with Domeleon, and uses the `@unocss/preset-wind3` preset as a peer dependency.

## Maskito

Domeleon has wrappers for `maskito`'s mask editors. The built in `number` input in HTML is terrible; use `maskito` instead. It's far cleaner, more powerful, and works uniformly across all browsers.

```ts
import { inputMask, inputNumber } from 'domeleon/maskito'
```

You can use it exactly like you would `inputText` or `inputRange`; the `inputProps` exposes the `maskito` object model to configure it. Here's an example of using `inputNumber` with a `formField`:

```ts
  formField({   
    prop: () => this.rating, 
    inputFn: inputNumber, 
    inputProps: {
      numberParams: {
        maximumFractionDigits: 1,
        decimalSeparator: '.'
      }
    }
  })
```

## Component Communication

### Child-To-Parent Communication

Generally, a child doesn't *need* to talk to its parents; it looks after itself, and delegates to its own children. However, sometimes the best way to manage complexity is to break this generalisation. There are 4 main patterns for doing so:

#### Callbacks

In this child-to-parent communication pattern, the parent passes functions down to child views/components:

```ts
  // Parent
  view() { return this.child.view({ onSave: () => this.handleSave() }) }
  handleSave() { this.update(...) }

  // Child
  view(props: { onSave?: () => void }) { ... }
```

#### Parent Interface

In this child-to-parent communication pattern, the child accesses its parent via `this.ctx.parent`. The child then casts the parent to an interface that limits scope and prevents circular type references. Now the child can read state or call methods.

In this example, we want the `Animal` component to get its family's `name`, so we allow this via an `IFamily` interface:

```ts
  interface IFamily { name: string }

  class Family extends Component implements IFamily {
    name: string
    animals: Animal[]
  }
    
  class Animal extends Component {
    get family() { return this.ctx.parent as IFamily }  
    
    foo() {
      const name = this.family.name
    }
  }
```

#### Root Interface

Building on the previous idea, sometimes it's useful for the `root` component to expose an interface, that any deeply nested child component can reference.

Here our root component implements `IZoo`:

```ts
  interface IZoo {
     families: IFamily[]
  }

  class Zoo extends Component implements IZoo {
     families: Family[]
  }

  class Family {...}
    
  class Animal extends Component {
    get zoo () { return this.root as IZoo }
    goo() {
      const pride = this.zoo.families.find(f => f.name == "Lion")      
    }
  }
```
Key things to remember:

* Keep your interfaces limited. Don't expose more than you need to; the less you expose the less you need to reason about.
* Avoid children accessing parents, but only to a point: if you're tying yourself in knots trying to be "pure", you're merely trading one type of complexity for another.

#### Update Path

In this child-to-parent communication pattern, the parent overrides `onUpdated (event: UpdateEvent)` to react to *any* update originating from its children (or itself).
  ```ts
  // Parent
  onUpdated(event: UpdateEvent) {
     ...
  } 
  ```
This will also catch any input, validator, router & serializer events.

>Tip: To know what update events pass through `onUpdated`, use the Inspector.

### Component to Non-Component Communication

Within the component layer, *maintain a single source of truth*, i.e. avoid duplicating state across components. But when crossing boundaries, consider *synchronizing* between your component and the other object's state.

#### Synchronization Examples

`Component` + DOM Element: Use `inputXxx` databinding functions to automatically synchronize between your component state and DOM state.

`Component` + `router`: Use the `onNavigate`/`onNavigated` events on `Component` to synchronize between your component and the browser's location captured in your component `router`'s `selectedSegment`.

>**💡Guideline:** if the state in question should be serialized with your component, it belongs on your component, if it merely emphemerally exists elsewhere at the same time.
