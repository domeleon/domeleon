import { App, type IApp, type UpdateEvent } from 'domeleon'
import { themeMgr } from './theme/inspectorTheme.js'
import { defaultInspectorSettings, type IInspector, type InspectorSettings } from './inspectorType.js'
import { InspectorPanel } from './coreui/inspectorPanel.js'

export class Inspector implements IInspector {
  private readonly _inspectorApp: IApp
  private readonly _hostElement: HTMLDivElement
  private readonly _toggleHandle: HTMLDivElement
  private readonly _settings: InspectorSettings
  private readonly _inspectorPanel: InspectorPanel
  private readonly _hostId!: string
  private readonly _id!: string

  constructor(targetApp: IApp, settingsOverrides: Partial<InspectorSettings> = {}) {
    this._settings = { ...defaultInspectorSettings, ...settingsOverrides }
    this._hostId = "inspector"
    this._id = this._hostId
    this._hostElement = this.ensureHostElement()

    this._inspectorPanel = new InspectorPanel(targetApp.root, this)
    this._inspectorApp = new App({
      root: this._inspectorPanel,
      id: this._id,
      autoPersist: true,
      cssAdapter: themeMgr.unoCssAdapter,
      plugins: [{ onUpdated: () => { this.refreshInspectorHostUI() } }]
    })    
    this._toggleHandle = this.createToggler()      
    this.refreshInspectorHostUI()
  }

  private refreshInspectorHostUI() {
    this.refreshHostElement()
    this.refreshToggler()
    setTimeout(() => { this._hostElement.style.opacity = '1'}, 0)
  }

  toggleVisible() {
    this.isVisible = !this.isVisible
  }

  get settings() { return this._settings }

  get isVisible() {
    return localStorage.getItem(`${this._hostId}-visible`) !== 'false'
  }

  set isVisible(value: boolean) {
    localStorage.setItem(`${this._hostId}-visible`, value.toString())
    this.refreshInspectorHostUI()
    if (value) {
      this._inspectorPanel.update()
    }
  }

  private ensureHostElement(): HTMLDivElement {
    let hostEl = document.getElementById(this._hostId) as HTMLDivElement | null
    if (!hostEl) {
      hostEl = document.createElement('div')
      hostEl.id = this._hostId
      document.body.appendChild(hostEl)
    }
    Object.assign(hostEl.style, styles.host)
    return hostEl
  }

  private refreshHostElement() {
    if (this.isVisible) {            
      const w = this._inspectorPanel.splitter.width            
      document.body.style.marginRight = `${w}px`
      Object.assign(this._hostElement.style, { width: `${w}px`, display: 'block' })
    }
    else {
      this._hostElement.style.display = 'none'
      document.body.style.marginRight = ''
    }
  }

  private createToggler(): HTMLDivElement {
    const handle = document.createElement('div')
    Object.assign(handle.style, styles.toggler)    
    handle.addEventListener('click', () => this.toggleVisible())
    document.body.appendChild(handle)
    return handle
  }

  private refreshToggler() {
    this._toggleHandle.textContent = this.isVisible ? '👍' :'🧐'
  }

  /** Called by the inspector plug-in to log an update from the target App. */
  recordUpdate(evt: UpdateEvent) {
    this._inspectorPanel.inspectorEvents.record(evt)
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