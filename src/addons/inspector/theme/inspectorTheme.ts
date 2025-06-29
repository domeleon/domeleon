import presetWind3 from '@unocss/preset-wind3'
import { UnoThemeManager } from '../../unocss/index.js'

export const inspectorTheme = {
  colors: {
    textPrimary: 'rgb(255, 255, 255)',
    textSecondary: 'rgb(212, 212, 212)',
    bgPrimary: 'rgb(30, 30, 30)',
    bgSecondary: 'rgb(128, 128, 128)',
    bgAlt: 'rgb(50, 50, 50)',
    bgAltHover: 'rgb(60, 60, 60)',
    borderNeutral: 'rgb(51, 51, 51)',
    bgAccent: 'rgb(0, 153, 255)',
    /* additional semantic colors */
    router: 'rgb(0, 153, 255)',
    input: 'rgb(0, 173, 158)',
    serializer: 'rgb(155, 104, 230)',
    validation: 'rgb(255, 162, 0)',
    valid: 'rgb(0, 255, 0)',
    validating: 'rgb(255, 162, 0)',
    invalid: 'rgb(255, 0, 0)',
    key: 'rgb(212, 212, 212)',
    value: 'rgb(221, 216, 121)',
  }
}

export const themeMgr = new UnoThemeManager({
  id: 'inspector',
  themes: { default: inspectorTheme },
  unoCssConfig: { presets: [presetWind3()] }
})

// Non-theme dimension helpers used by Inspector components
export const sizes = new class {
  indentPx = 8
  arrow = {
    md: '1em',
    sm: '0.75em'
  }
  font = {
    small: '0.9em',
    medium: '0.95em',
    lineHeightCompact: '1.2em'
  }
  pad = {
    xs: '0.125em',   // 2px when root font-size = 16px
    sm: '0.25em',    // 4px
    md: '0.5em',     // 8px
    lg: '0.75em',    // 12px
    xl: '1em'        // 16px
  }
  panel = {
    initial: 340,
    min: 300,
    max: 800
  }        
  buttonRadius = `3px`
  splitterWidth = `4px`
  borderWidthThin = '1px'
  borderWidthThick = '2px'
}()

export const commonStyles = themeMgr.styles (theme => {
  const { bgAlt, bgAltHover, textPrimary, bgSecondary, textSecondary } = theme.colors

  return {
    button: 
     `m-[${sizes.pad.md}]
      px-[${sizes.pad.xl}]
      py-[${sizes.pad.sm}]    
      cursor-pointer
      bg-${bgAlt}
      hover:bg-${bgAltHover}
      text-${textSecondary}
      text-[${sizes.font.small}]
      hover:text-${textPrimary}    
      border border-${bgSecondary}
      border-solid
      rounded-[${sizes.buttonRadius}]`    
  }
})

export const indent = (depth: number) => ({ marginLeft: `${depth * sizes.indentPx}px` })