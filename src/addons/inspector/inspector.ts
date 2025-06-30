import { App } from '../../index.js'
import { themeMgr } from './theme/inspectorTheme.js'
import { defaultInspectorSettings, type IInspector, type InspectorSettings } from './inspectorType.js'
import { InspectorPanel } from './coreui/inspectorPanel.js'
import type { UpdateEvent } from '../../component/componentTypes.js'

export class Inspector implements IInspector {
  #inspectorApp: App
  #hostElement: HTMLDivElement
  #toggleHandle: HTMLDivElement
  #settings: InspectorSettings
  #inspectorPanel: InspectorPanel
  #hostId!: string
  #containerId!: string

  constructor(targetApp: App, settingsOverrides: Partial<InspectorSettings> = {}) {
    this.#settings = { ...defaultInspectorSettings, ...settingsOverrides }
    this.#hostId = "inspector"
    this.#containerId = this.#hostId
    this.#hostElement = this.#ensureHostElement()

    this.#inspectorPanel = new InspectorPanel(targetApp.rootComponent, this)
    this.#inspectorApp = new App({
      rootComponent: this.#inspectorPanel,
      containerId: this.#containerId,
      autoPersist: true,
      cssAdapter: themeMgr.unoCssAdapter,
      plugins: [{ onUpdated: () => { this.#refreshInspectorContainerUI() } }]
    })    
    this.#toggleHandle = this.#createToggler()      
    this.#refreshInspectorContainerUI()
  }

  #refreshInspectorContainerUI() {
    this.#refreshHostElement()
    this.#refreshToggler()
    setTimeout(() => { this.#hostElement.style.opacity = '1'}, 0)
  }

  toggleVisible() {
    this.isVisible = !this.isVisible
  }

  get settings() { return this.#settings }

  get isVisible() {
    return localStorage.getItem(`${this.#hostId}-visible`) !== 'false'
  }

  set isVisible(value: boolean) {
    localStorage.setItem(`${this.#hostId}-visible`, value.toString())
    this.#refreshInspectorContainerUI()
    if (value) {
      this.#inspectorPanel.update()
    }
  }

  #ensureHostElement(): HTMLDivElement {
    let hostEl = document.getElementById(this.#hostId) as HTMLDivElement | null
    if (!hostEl) {
      hostEl = document.createElement('div')
      hostEl.id = this.#hostId
      document.body.appendChild(hostEl)
    }
    Object.assign(hostEl.style, styles.host)
    return hostEl
  }

  #refreshHostElement() {
    if (this.isVisible) {            
      const w = this.#inspectorPanel.splitter.width            
      document.body.style.marginRight = `${w}px`
      Object.assign(this.#hostElement.style, { width: `${w}px`, display: 'block' })
    }
    else {
      this.#hostElement.style.display = 'none'
      document.body.style.marginRight = ''
    }
  }

  #createToggler(): HTMLDivElement {
    const handle = document.createElement('div')
    Object.assign(handle.style, styles.toggler)    
    handle.addEventListener('click', () => this.toggleVisible())
    document.body.appendChild(handle)
    return handle
  }

  #refreshToggler() {
    this.#toggleHandle.textContent = this.isVisible ? '👍' :'🧐'
  }

  /** Called by the inspector plug-in to log an update from the target App. */
  recordUpdate(evt: UpdateEvent) {
    this.#inspectorPanel.inspectorEvents.record(evt)
  }
}

const styles = {
  host: {
    opacity: '0',
    position: 'fixed',
    top: '0',
    right: '0',
    height: '100vh',
    zIndex: '9999',
    fontFamily: 'sans-serif'
  },
  toggler: {
    position: 'fixed',
    top: '0.1rem',
    right: '1rem',
    cursor: 'pointer',
    zIndex: '9999',
    fontSize: '1.5rem'
  }
}