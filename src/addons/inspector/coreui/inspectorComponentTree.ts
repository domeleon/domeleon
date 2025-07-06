import { Component, type VElement, div, span, isRouted, componentSkipProps } from '../../../index.js'
import { svgArrowArray, svgArrowArrayPrivate, svgArrow } from '../helper/arrow.js'
import { indent, sizes, themeMgr } from '../theme/inspectorTheme.js'
import type { IInspector } from '../inspectorType.js'
import { clamp, isPrimitive } from '../helper/util.js'

/* ──────────────────────────────  VARIANTS  ────────────────────────────── */

type Variant = 'public' | 'private'

const variantStyles = (variant: Variant) => ({
  prop        : variant === 'public' ? componentTreeStyles.prop                : componentTreeStyles.privateProp,
  propLabel   : variant === 'public' ? componentTreeStyles.propLabel           : componentTreeStyles.privatePropLabel,
  propValue   : variant === 'public' ? componentTreeStyles.propValue           : componentTreeStyles.privatePropValue,
  arrayHeader : variant === 'public' ? componentTreeStyles.arrayHeader         : componentTreeStyles.privateArrayHeader,
  arrayKey    : variant === 'public' ? componentTreeStyles.arrayKey            : componentTreeStyles.privateArrayKey,
  arrayItem   : variant === 'public' ? componentTreeStyles.arrayPrimitive      : componentTreeStyles.privateArrayPrimitive,
})

/* ────────────────────────────  INSPECTOR  ─────────────────────────────── */

export class InspectorComponentTree extends Component {
  _root: Component
  _inspector: IInspector
  _collapse = new Map<string, boolean>()

  constructor(root: Component, inspector: IInspector) {
    super()
    this._root       = root
    this._inspector  = inspector
  }

  /* ----------  public API for persisting expand/collapse state ---------- */

  get collapseState () {
    return [...this._collapse].map(([id, collapsed]) => ({ id, collapsed }))
  }
  set collapseState (s: { id: string; collapsed: boolean }[]) {
    this._collapse = new Map(s.map(o => [o.id, o.collapsed]))
  }

  /* --------------------------------------------------------------------- */

  override onAttached() { this._initCollapse() }

  _toggle(id: string) {
    /*  If this node has never been seen before we assume it's collapsed (=true),
        so the very first click will expand it. */
    const prev = this._collapse.has(id) ? this._collapse.get(id)! : true
    this._collapse.set(id, !prev)
    this.update()
  }

  _initCollapse() {
    const { autoOpenDepth } = this._inspector.settings
    /*  Start with the previous map so we keep states for
        things the walker doesn't know about (-private nodes, etc.).   */
    const prev = this._collapse
    const next = new Map<string, boolean>(prev)

    const walk = (c: Component, depth = 0) => {
      const id = ''+c.ctx.componentId
      next.set(id, prev.get(id) ?? depth >= autoOpenDepth)

      for (const key of c.ctx.dataKeys) {
        const v = (c as any)[key]
        if (Array.isArray(v) && v.length) {
          const aid = `${id}-array-${key}`
          next.set(aid, prev.get(aid) ?? depth+1 >= autoOpenDepth)
          v.filter(x => x instanceof Component).forEach(x => walk(x as Component, depth+2))
        } else if (v instanceof Component) {
          walk(v, depth+1)
        }
      }
    }
    walk(this._root)
    this._collapse = next
  }

  /* -------------------------  low-level helpers  ------------------------ */

  _children = (c: Component) =>
    Object.entries(c)
      .filter(([,v]) => v instanceof Component)
      .map(([name,v]) => ({ name, component: v as Component }))

  _primitive(label: string, raw: unknown, d: number, variant: Variant): VElement | null {
    if (!isPrimitive(raw)) return null
    if (this._inspector.settings.hideEmptyValues && (raw === '' || raw == null)) return null

    const { prop, propLabel, propValue } = variantStyles(variant)
    return div(
      { class: prop, style: indent(d) },
      span({ class: propLabel }, `${label}:`),
      span({ class: propValue }, clamp(raw, this._inspector.settings.maxTextLength)),
    )
  }

  _object(label: string, obj: Record<string,unknown>, d: number, v: Variant): VElement {
    const header = this._primitive(label, '[Object]', d, v)!
    const props  = Object.entries(obj)
      .map(([k,val]) => this._primitive(k, val, d+1, v))
      .filter(Boolean) as VElement[]
    return div(header, ...props)
  }

  _array(ownerId: string, key: string, arr: unknown[], d: number, variant: Variant): VElement[] {
    const sid           = `${ownerId}-${variant}-array-${key}`
    const collapsed     = this._collapse.get(sid) ?? true
    const { arrayHeader, arrayKey, arrayItem } = variantStyles(variant)

    const header = div(
      { onClick: () => this._toggle(sid), class: arrayHeader, style: indent(d+1) },
      (variant === 'public' ? svgArrowArray(collapsed) : svgArrowArrayPrivate(collapsed)),
      span({ class: arrayKey }, `${key} [${arr.length}]`)
    )
    if (collapsed) return [header]

    const items = arr.map((item,i) => {
      const depth = d+2
      if (item instanceof Component) return this._node(item, depth, `${key}[${i}]`)
      if (isPrimitive(item)) return div({ class: arrayItem, style: indent(depth) }, `${i}: ${item}`)
      if (item && typeof item === 'object') return this._object(`${key}[${i}]`, item as any, depth, variant)
      return div({ class: arrayItem, style: indent(depth) }, `${i}: [Unknown]`)
    })
    return [header, ...items]
  }

  /* -------------------------  private group ----------------------------- */

  _privateGroup(comp: Component, ownerId: string, d: number): VElement[] {
    const entries = Object.entries(comp).filter(([k]) => k.startsWith('_') && !componentSkipProps.includes(k))
    if (!entries.length) return []

    const id        = `${ownerId}-private`
    const collapsed = this._collapse.get(id) ?? true

    const header = div(
      { onClick: () => this._toggle(id), class: componentTreeStyles.privateHeader, style: indent(d+1) },
      svgArrowArrayPrivate(collapsed),
      span({ class: componentTreeStyles.privateLabel }, `Private [${entries.length}]`)
    )
    if (collapsed) return [header]

    const [primitives, arrays] = entries.reduce<[VElement[], VElement[]]>((p,[k,v]) => {
      if (Array.isArray(v) && v.length)      p[1].push(...this._array(ownerId, k, v, d+1, 'private'))
      else                                   { const n = this._primitive(k, v, d+2, 'private'); if (n) p[0].push(n) }
      return p
    }, [[],[]])

    return [header, ...primitives, ...arrays]
  }

  /* ---------------------------  main node  ------------------------------ */

  _node(comp: Component, d: number, label: string): VElement {
    const id        = ''+comp.ctx.componentId
    const collapsed = this._collapse.get(id) ?? false
    const router    = isRouted(comp) ? comp.router : undefined
    const fullPath  = router ? router.rootToHereRoute.pathOnly.toString() : ''

    /* header */
    const header = div(
      { key: id, class: componentTreeStyles.header, style: indent(d),
        onMouseDown: e => { e.preventDefault(); this._toggle(id) } },
      svgArrow(collapsed, !!router),
      router && span({ class: componentTreeStyles.path }, fullPath),
      span({ class: componentTreeStyles.name, style:{marginLeft: router ? '0.5em':'0.25em'} }, `${label}:`),
      span({ class: componentTreeStyles.class }, comp.constructor.name),
    )
    if (collapsed) return header

    /* primitives (public) */
    const primEntries: [string,unknown][] = [
      ['routeSegment', (comp as any).routeSegment],
      ['router.activeSegment', router?.activeSegment],
      ['validator.state', (comp as any).validator?.validationState],
      ...comp.ctx.dataKeys.filter(k => k!=='routeSegment').map(k => [k,(comp as any)[k]] as [string, unknown]),
    ]
    const primitives = primEntries
      .map(([k,v]) => this._primitive(k,v,d+2,'public'))
      .filter(Boolean) as VElement[]

    /* groups */
    const privGroup = this._privateGroup(comp, id, d)
    const arrays    = Object.entries(comp)
      .filter(([k,v]) => Array.isArray(v) && v.length && !k.startsWith('_'))
      .flatMap(([k,v]) => this._array(id,k,v as any[],d,'public'))
    const children  = this._children(comp).map(ch => this._node(ch.component, d+1, ch.name))

    return div(header, ...primitives, ...privGroup, ...arrays, ...children)
  }

  /* ------------------------------ view ---------------------------------- */

  view(): VElement {
    return div({ class: componentTreeStyles.innerPanel },
      this._node(this._root, 0, '[root]'))
  }
}

/* ─────────────────────────────  styles  ──────────────────────────────── */

const componentTreeStyles = themeMgr.styles('tree', theme => {
  const { router: routerColor, textSecondary, bgSecondary,
          key: keyColor, value: valueColor } = theme.colors
  return {
    innerPanel:   `my-[${sizes.pad.md}]`,
    header:       `p-[${sizes.pad.sm}] cursor-pointer whitespace-nowrap flex items-center`,
    path:         `ml-[${sizes.pad.sm}] font-bold text-${routerColor}`,
    name:         `font-bold text-${textSecondary}`,
    class:        `ml-[${sizes.pad.md}] text-${bgSecondary}`,

    /* public */
    prop:              `flex py-[${sizes.pad.xs}] items-center whitespace-nowrap`,
    propLabel:         `mr-[${sizes.pad.sm}] text-[${sizes.font.small}] text-${keyColor}`,
    propValue:         `text-${valueColor} text-[${sizes.font.small}]`,
    arrayHeader:       `py-[${sizes.pad.xs}] cursor-pointer whitespace-nowrap flex items-center`,
    arrayKey:          `ml-[${sizes.pad.sm}] text-${keyColor} text-[${sizes.font.small}]`,
    arrayPrimitive:    `whitespace-nowrap text-[${sizes.font.small}] text-${valueColor}`,

    /* private */
    privateHeader:          `py-[${sizes.pad.xs}] cursor-pointer whitespace-nowrap flex items-center`,
    privateLabel:           `ml-[${sizes.pad.sm}] text-${bgSecondary} text-[${sizes.font.small}] opacity-75`,
    privateProp:            `flex py-[${sizes.pad.xs}] items-center whitespace-nowrap`,
    privatePropLabel:       `mr-[${sizes.pad.sm}] text-[${sizes.font.small}] text-${bgSecondary} opacity-75`,
    privatePropValue:       `text-${bgSecondary} text-[${sizes.font.small}] opacity-60`,
    privateArrayHeader:     `py-[${sizes.pad.xs}] cursor-pointer whitespace-nowrap flex items-center`,
    privateArrayKey:        `ml-[${sizes.pad.sm}] text-${bgSecondary} text-[${sizes.font.small}] opacity-75`,
    privateArrayPrimitive:  `whitespace-nowrap text-[${sizes.font.small}] text-${bgSecondary} opacity-60`,
  }
})
