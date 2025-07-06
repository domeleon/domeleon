import { Component, div } from '../../../index.js'
import { sizes, themeMgr } from '../theme/inspectorTheme.js'
import type { IInspector } from '../inspectorType.js'
import { Splitter } from '../helper/splitter.js'
import { InspectorEvents } from './inspectorEvents.js'
import { InspectorComponentTree } from './inspectorComponentTree.js'
import { TabControl } from '../helper/tabControl.js'

export class InspectorPanel extends Component {  
  _panelElement!: HTMLDivElement
  splitter: Splitter
  inspectorEvents: InspectorEvents
  inspectorTree: InspectorComponentTree
  tabControl = new TabControl()
  scrollPosition = 0  

  constructor(targetRoot: Component, inspector: IInspector) {
    super()
    this.splitter = new Splitter(sizes.panel.initial)
    this.inspectorEvents = new InspectorEvents(targetRoot, inspector)
    this.inspectorTree = new InspectorComponentTree(targetRoot, inspector)
    this.tabControl.selected = 'tree'
  }

  view() {
    return (
      div ({ class: panelStyles.panel },
        this.splitter.view(),
        div ({ class: panelStyles.panelContainer,
          onMounted: e => {
            this._panelElement = e as HTMLDivElement
            this._panelElement.scrollTop = this.scrollPosition
          },
          onScrollEnd: () => {
            this.scrollPosition = this._panelElement.scrollTop
            this.update()
          }
        },
          this.tabControl.view({
            tabs:[
              {
                id: 'tree',
                label: 'Component Tree',
                view: () => this.inspectorTree.view()
              },{
                id: 'events',
                label: `Updates (${this.inspectorEvents.eventCount})`,
                view: () => this.inspectorEvents.view()
              }
            ]
          })
        )
      )
    )
  }
}

export const panelStyles = themeMgr.styles("panel", theme => {
  const { bgPrimary, textSecondary: textSecondary } = theme.colors

  return {
    splitter: `w-[${sizes.splitterWidth}] cursor-col-resize bg-[#444] select-none shrink-0`,
    panel: `flex flex-row h-screen bg-${bgPrimary}`,
    panelContainer: `box-border h-full overflow-y-auto overflow-x-scroll overscroll-contain bg-${bgPrimary} text-${textSecondary} flex-grow min-w-0`  
  }
})