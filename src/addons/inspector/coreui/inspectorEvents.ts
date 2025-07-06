import { Component, type UpdateEvent, div, span, button } from '../../../index.js'
import { commonStyles, sizes, themeMgr } from '../theme/inspectorTheme.js'
import { type IInspector, type LoggedEvent } from '../inspectorType.js'
import { isPrimitive, clamp } from '../helper/util.js'
import { handlerFor } from './inspectorEventCauses.js'
import type { CssVar } from '../../unocss/index.js'

export class InspectorEvents extends Component {
  _stateChanges = new WeakMap<Component, Record<string, any>>()
  _inspector: IInspector
  logged: LoggedEvent[] = []

  get eventCount() {
    return this.logged.length
  }

  constructor (targetRoot: Component, inspector: IInspector) {
    super()
    this._inspector = inspector
  }

  _componentLabel (comp: Component) {
    const parent = comp.ctx.parent
    if (! parent) return "[root]"
    return parent.ctx.childKey(comp) || "[]"
  }
  
  record(evt: UpdateEvent) {    
    const prev = this._stateChanges.get(evt.component)
    const curr: Record<string, any> = {}

    evt.component.ctx.dataKeys.forEach(k => {
      const v = (evt.component as any)[k]
      if (isPrimitive(v)) curr[k] = v
    })

    const changes = Object.keys(curr)
      .filter(k => prev?.[k] !== curr[k])
      .map(k => ({ key: k, newValue: String(curr[k]) }))

    this._stateChanges.set(evt.component, curr)

    this.logged.push({
      compName: this._componentLabel(evt.component),
      compType: evt.component.constructor.name,
      depth: evt.component.ctx.rootToHere.length - 1,
      changes: changes,
      cause: evt.cause,
      key: changes.some(x => x.key === evt.key) ? undefined : evt.key,
      value: changes.some(x => x.key === evt.key) ? undefined : evt.value,      
      timestamp: Date.now(),
      ...handlerFor(evt.cause)?.values?.(evt)
    })

    this.logged.splice(0, Math.max (this.logged.length - this._inspector.settings.maxEvents, 0))
    this.updateIfVisible()
  }

  updateIfVisible() {
    if (this._inspector.isVisible) {
      this.update()
    }
  }

  _clear () {
    this.logged = []
    this.update()
  }

  view() {
    const none = !this.logged.length
    return div({ class: styles.innerPanel },
      button({ class: commonStyles.button, onClick: () => this._clear() }, 'Clear'),
      none ? div({ class: styles.none }, '(none)')
           : this.logged.slice().reverse().map(e => this._renderRow(e))
    )
  }

  mapBlankValue (value?: string) {
    return value === "" ? `""` : value    
  }

  getPairs (ev: LoggedEvent) {
    const handler = handlerFor(ev.cause)
    const coercedEv = ev as unknown as UpdateEvent
    return [        
       { key: "cause", value: ev.cause ?? "custom" },
       ...Object.entries (handler?.values?.(coercedEv) || {}).map(([k, v]) => ({key: k, value: v})),
       {key: ev.key, value: ev.value},
       ...ev.changes.map(({ key, newValue }) => ({key: key, value: newValue}))
    ]
    .map(pair => ({ key: pair.key, value: this.mapBlankValue(pair.value) }))
  }

  _renderRow (ev: LoggedEvent) {
    const handler = handlerFor(ev.cause)
    const pairs = this.getPairs(ev)
    const coercedEv = ev as unknown as UpdateEvent

    const headerLine = div({ class: styles.headerLine },      
      span({ class: styles.compName }, `${ev.compName}:`),
      span({ class: styles.compType }, `${ev.compType}`),
    )

    const detailsLine = div({ class: styles.details },
      pairs.map(pair => this._renderPair(pair.key, pair.value, handler?.color(coercedEv, pair.key)))
    )

    return div({ class: styles.rowContainer }, headerLine, detailsLine)
  }
  
  _renderPair (key?: string, value?: string, color?: CssVar) {    
    return key && span(
      span({ class: styles.label }, `${key}:`),
      span({ class: [styles.value, `text-${color || themeMgr.theme.colors.value}`] },
        clamp(value, this._inspector.settings.maxTextLength))
    )
  }
}

const styles = themeMgr.styles("event", theme => {
  const { bgSecondary, textSecondary } = theme.colors

  return {
    none: `ml-[${sizes.pad.sm}] text-${bgSecondary} text-[${sizes.font.small}]`,  
    innerPanel: `m-[${sizes.pad.md}]`,  
    rowContainer: `my-[${sizes.pad.md}] mx-[${sizes.pad.sm}]`,  
    headerLine: `flex items-center`,
    compName: `mr-[${sizes.pad.md}] text-${textSecondary} font-bold`,
    compType: `mr-[${sizes.pad.sm}] text-${bgSecondary}`,    
    details: `ml-[${sizes.pad.md}] flex flex-wrap items-center text-[${sizes.font.small}] leading-[${sizes.font.lineHeightCompact}]`,  
    label: `mr-[${sizes.pad.sm}]`,
    value: `mr-[${sizes.pad.md}]`
  }
})