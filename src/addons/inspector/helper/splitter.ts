import { Component, div, type VElement } from '../../../index.js'
import { sizes, themeMgr } from '../theme/inspectorTheme.js'

export class Splitter extends Component {
  #width: number

  constructor(initialWidth: number) {
    super()
    this.#width = initialWidth
  }

  get width() { return this.#width }

  set width(value: number) {
    this.#width = value
    this.update()
  } 

  view(): VElement {
    return div({
      class: styles.splitter,
      onMouseDown: (e: MouseEvent) => this.handleMouseDown(e)
    })
  }

  handleMouseDown(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = this.#width
    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX
      let newWidth = startWidth + delta
      if (newWidth < sizes.panel.min) newWidth = sizes.panel.min
      if (newWidth > sizes.panel.max) newWidth = sizes.panel.max
      this.width = newWidth
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
}

const styles = themeMgr.styles("splitter", theme => {
  const { bgAlt: bgTertiary } = theme.colors
  return {
    splitter: `w-[${sizes.splitterWidth}] cursor-col-resize bg-${bgTertiary} select-none shrink-0`
  }
})