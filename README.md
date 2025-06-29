# Domeleon

Build web UIs with classes encapsulating your domain model and a pluggable Preact/React/Vue VDOM.

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

Here's a Counter component in Domeleon within an HTML page. No build step required—just drop this into an HTML page.

```html
<!-- index.html -->
<div id="app"></div>
<script type="module">
  import { App, Component, div, button } from 'https://cdn.skypack.dev/domeleon@latest'

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

new App({
  rootComponent: new Counter(),
  containerId: 'app'
})
</script>
```

Application state lives in your components — in this case `count`.

Components optionally implement a `view` method, but since they represent your domain model, rather than a wrapper around a DOM element, you can have multiple views, e.g. `summaryView` or `detailView`. A view is a pure non-side-effecting function of the `Component`'s state returning an immutable `VElement`.

Components update their state via their `update` method, which triggers a re-render of the root component's `view`. Features like databinding, routing, and serialization, all automatically call `update` for you, which you can monitor with domeleon's `inspector` module.

## Installation

## npm:
```bash
npm install domeleon
```

## ES module CDNs:
```js
// skypack
import { App, Component, div, button } from 'https://cdn.skypack.dev/domeleon@latest'

// esm.sh
import { App, Component, div, button } from 'https://esm.sh/domeleon@latest'
```

## Documentation

For detailed guides and API reference, please see the [full documentation website](https://domeleon.github.io/domeleon/domeleon/docs/).