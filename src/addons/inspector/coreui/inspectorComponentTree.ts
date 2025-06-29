import { Component, type VElement, div, span, isRouted } from '../../../index.js'
import { svgArrowArray, svgArrow } from '../helper/arrow.js'
import { indent, sizes, themeMgr } from '../theme/inspectorTheme.js'
import type { IInspector } from '../inspectorType.js'
import { clamp, isPrimitive } from '../helper/util.js'

export class InspectorComponentTree extends Component {
  #targetRoot: Component
  #inspector: IInspector
  #collapseMap = new Map<string, boolean>()

  constructor(root: Component, inspector: IInspector) {
    super()
    this.#targetRoot = root
    this.#inspector = inspector
  }

  get collapseState () {    
    return Array.from(this.#collapseMap.entries()).map(([id, collapsed]) => ({ id, collapsed }))
  }

  set collapseState (state: { id: string; collapsed: boolean }[]) {
    this.#collapseMap = new Map(state.map(({ id, collapsed }) => [id, collapsed]))
  }

  override onAttached(): void {    
    this.#initCollapseStates()    
  }

  #toggle(id: string) {
    const prev = this.#collapseMap.get(id) ?? false
    this.#collapseMap.set(id, !prev)
    this.update()
  }

  #initCollapseStates() {
    const autoDepth = this.#inspector.settings.autoOpenDepth
    const oldMap = this.#collapseMap
    const nextMap = new Map<string, boolean>()

    const walk = (c: Component, depth = 0): void => {
      const id = ""+c.ctx.componentId
      const defaultCollapsed = depth >= autoDepth
      const prev = oldMap.has(id) ? oldMap.get(id)! : defaultCollapsed
      nextMap.set(id, prev)
      for (const key of c.ctx.dataKeys) {
        const val = (c as any)[key]
        if (Array.isArray(val) && val.length > 0) {
          const arrId = `${id}-array-${key}`
          const defaultArrCollapsed = depth + 1 >= autoDepth
          const prevArr = oldMap.has(arrId) ? oldMap.get(arrId)! : defaultArrCollapsed
          nextMap.set(arrId, prevArr)
          for (const item of val) {
            if (item instanceof Component) {
              walk(item, depth + 2)
            }
          }
        } else if (val instanceof Component) {
          walk(val, depth + 1)
        }
      }
    }

    walk(this.#targetRoot, 0)
    this.#collapseMap = nextMap
  }
  
  #children(c: Component) {
    return Object.entries(c)
      .filter(([, v]) => v instanceof Component)
      .map(([name, component]) => ({ name, component: component as Component }))
  }

  #renderPrimitive(label: string, raw: unknown, d: number): VElement | null {
    if (!isPrimitive(raw)) return null
    if (this.#inspector.settings.hideEmptyValues && (raw === '' || raw == null)) return null

    const val = clamp(raw, this.#inspector.settings.maxTextLength)

    return div(
      { class: componentTreeStyles.prop, style: indent(d) },
      span({ class: componentTreeStyles.propLabel }, `${label}:`),
      span({ class: componentTreeStyles.propValue }, val)
    )
  }

  #renderObject(obj: any, d: number, label: string): VElement {
    const entries = Object.entries(obj)

    const header = div(
      { class: componentTreeStyles.prop, style: indent(d) },
      span({ class: componentTreeStyles.propLabel }, `${label}:`),
      span({ class: componentTreeStyles.propValue }, '[Object]')
    )

    const propNodes = entries
      .map(([k, v]) => this.#renderPrimitive(k, v, d + 1))
      .filter((x): x is VElement => !!x)

    return div(header, ...propNodes)
  }

  #renderArray(owner: string, key: string, arr: unknown[], d: number): VElement[] {
    const idArr = `${owner}-array-${key}`    
    const arrCollapsed = this.#collapseMap.get(idArr) ?? true
    
    const arrayHeader = div({
        onClick: () => this.#toggle(idArr),
        class: componentTreeStyles.arrayHeader,
        style: indent(d + 1),
      },
      svgArrowArray(arrCollapsed),
      span({ class: componentTreeStyles.arrayKey }, `${key} [${arr.length}]`)
    )

    if (arrCollapsed) {
      return [arrayHeader]
    }

    // if expanded, every item at depth = d + 2
    const items = arr.map((item, i) => {
      const itemDepth = d + 2

      if (item instanceof Component) {
        return this.#renderNode(item, itemDepth, `${key}[${i}]`)
      }

      if (isPrimitive(item)) {
        return div(
          { class: componentTreeStyles.arrayPrimitive, style: indent(itemDepth) },
          `${i}: ${String(item)}`
        )
      }

      if (item && typeof item === 'object') {
        return this.#renderObject(item, itemDepth, `${key}[${i}]`)
      }

      // fallback for any other type
      return div(
        { class: componentTreeStyles.arrayPrimitive, style: indent(itemDepth) },
        `${i}: [Unknown]`
      )
    })

    return [arrayHeader, ...items]
  }

  /**
   * The main recursive routine.  Header at indent(d). Then:
   *  - all primitives at indent(d + 1) via #renderPrimitive  
   *  - all arrays via #renderArray(ownerId, key, arr, d)  
   *  - all child-components at indent(d + 1) via recursive #renderNode
   */
  #renderNode(comp: Component, d: number, label: string): VElement {
    const id = ""+comp.ctx.componentId
    const collapsed = this.#collapseMap.get(id) ?? false
    const router = isRouted(comp) ? comp.router : undefined
    const fullPath = router ? router.rootToHereRoute.pathOnly.toString() : ''

    /* ─── COMPONENT HEADER (depth = d) ─── */
    const header = div({
        key: id,
        class: componentTreeStyles.header,
        style: indent(d),
        onMouseDown: e => {
          e.preventDefault()
          this.#toggle(id)
        },
      },
      svgArrow(collapsed, !!router),
      router && span({ class: componentTreeStyles.path }, fullPath),
      span(
        { class: componentTreeStyles.name, style: { marginLeft: router ? '0.5em' : '0.25em' } },
        label +":"
      ),
      span({ class: componentTreeStyles.class }, comp.constructor.name)
    )

    if (collapsed) {
      return header
    }

    /* ─── 1) PRIMITIVE PROPS at depth = d + 1 ─── */
    const primitiveEntries: [string, unknown][] = [
      ['routeSegment', (comp as any).routeSegment],
      ['router.activeSegment', router?.activeSegment],
      ['validator.state', (comp as any).validator?.validationState],
      ...comp.ctx.dataKeys
        .filter(k => k !== 'routeSegment')
        .map(k => [k, (comp as any)[k]] as [string, unknown]),
    ]

    const primitives = primitiveEntries
      .map(([k, v]) => this.#renderPrimitive(k, v, d + 2))
      .filter((x): x is VElement => !!x)

    /* ─── 2) ARRAYS ─── */
    const arrays = Object.entries(comp)
      .filter(([, v]) => Array.isArray(v) && (v as any[]).length)
      .flatMap(([k, v]) => this.#renderArray(id, k, v as any[], d))

    /* ─── 3) CHILD COMPONENTS at depth = d + 1 ─── */
    const children = this.#children(comp).map(({ component: c, name }) =>
      this.#renderNode(c, d + 1, name)
    )

    /* ─── COMBINE EVERYTHING ─── */
    return div(header, ...primitives, ...arrays, ...children)
  }

  view(): VElement {
    return div ({ class: componentTreeStyles.innerPanel },
        this.#renderNode(this.#targetRoot, 0, '[root]')
    )
  }
}

const componentTreeStyles = themeMgr.styles("tree", theme => {
  const { router: routerColor, textSecondary, bgSecondary, key: keyColor, value: valueColor } = theme.colors
  return {
    innerPanel: `my-[${sizes.pad.md}]`,
    header: `p-[${sizes.pad.sm}] cursor-pointer whitespace-nowrap flex items-center`,
    path: `ml-[${sizes.pad.sm}] font-bold text-${routerColor}`,
    name: `font-bold text-${textSecondary}`,
    class: `ml-[${sizes.pad.md}] text-${bgSecondary}`,
    prop: `flex py-[${sizes.pad.xs}] items-center whitespace-nowrap`,
    propLabel: `mr-[${sizes.pad.sm}] text-[${sizes.font.small}] text-${keyColor}`,
    propValue: `text-${valueColor} text-[${sizes.font.small}]`,
    arrayHeader: `py-[${sizes.pad.xs}] cursor-pointer whitespace-nowrap flex items-center`,
    arrayKey: `ml-[${sizes.pad.sm}] text-${keyColor} text-[${sizes.font.small}]`,
    arrayPrimitive: `whitespace-nowrap text-[${sizes.font.small}] text-${valueColor}`,
  }
})