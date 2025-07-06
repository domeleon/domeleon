import { svg, polygon } from '../../../index.js'
import { sizes, themeMgr } from '../theme/inspectorTheme.js'

function makeArrow(isCollapsed: boolean, classes: string[]) {
  return svg(
    {
      role: 'img',
      ariaLabel: isCollapsed ? 'expand' : 'collapse',
      viewBox: '0 0 16 16',
      class: classes,
    },
    polygon({
      points: isCollapsed ? '4,2 14,8 4,14' : '2,4 8,14 14,4',
      fill: 'currentColor',
    }),
  )
}

export const svgArrow = (isCollapsed: boolean, hasRouter = false) =>
  makeArrow (isCollapsed, [styles.arrow, hasRouter ? styles.colorRouter : styles.colorSecondary])

export const svgArrowArray = (arrCollapsed: boolean) =>
  makeArrow(arrCollapsed, [styles.arrowArray])

export const svgArrowArrayPrivate = (arrCollapsed: boolean) =>
  makeArrow(arrCollapsed, [styles.arrowArrayPrivate])

const styles = themeMgr.styles('svg', theme => {
  const { textSecondary, router, bgSecondary } = theme.colors
  return {
    arrow: `w-[${sizes.arrow.md}] h-[${sizes.arrow.md}] shrink-0`,
    arrowArray: `w-[${sizes.arrow.sm}] h-[${sizes.arrow.sm}] shrink-0 text-${textSecondary}`,
    arrowArrayPrivate: `w-[${sizes.arrow.sm}] h-[${sizes.arrow.sm}] shrink-0 text-${bgSecondary} opacity-75`,
    colorSecondary: `text-${textSecondary}`,
    colorRouter: `text-${router}`,
  }
})  