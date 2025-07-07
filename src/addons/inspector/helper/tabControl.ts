// tabView.ts (revised)
import { Component, type VElement, div, span } from 'domeleon'
import { sizes, themeMgr } from "../theme/inspectorTheme.js"

export type Tab = {
  id: string
  label: string
  view: () => VElement
}

export class TabControl extends Component {
  _selected = ""
  get selected() { return this._selected }
  set selected(value: string) {
    this._selected = value
    this.update()        
  }

  view(props: { tabs: Tab[] }): VElement {
    return div(
      div({ class: tabStyles.headerContainer },
        props.tabs.map(({ id, label }) =>
          span({
            onClick: () => { this.selected = id },
            class: [tabStyles.base, this.selected === id ? tabStyles.active : tabStyles.inactive]
          },
            label
          )
        )
      ),
      div({ class: tabStyles.bodyContainer },
        props.tabs.find(tab => tab.id === this.selected)?.view()
      )
    )
  }
}

const tabStyles = themeMgr.styles("tab", theme => {
  const { textPrimary, bgAccent, bgSecondary, borderNeutral, bgPrimary, textSecondary } = theme.colors

  return {
    base: `p-[${sizes.pad.lg}] cursor-pointer select-none text-[${sizes.font.medium}] border-0 border-b-[${sizes.borderWidthThick}] border-b-solid`,
    active: `text-${textPrimary} border-b-${bgAccent} font-bold`,
    inactive: `text-${bgSecondary} border-b-transparent font-normal`,
    headerContainer: `flex border-b-[${sizes.borderWidthThin}] border-${borderNeutral} border-b-solid bg-${bgPrimary}`,
    bodyContainer: `bg-${bgPrimary} text-${textSecondary}`
  }
})