import { CssVar } from './themingTypes.js'

export class ColorVar extends CssVar
{
  constructor (name: string, rawColorString: string, cssVarName: string) {
    super(name, rawColorString, cssVarName)
  }

  override get css() {
    return `rgb(${super.css})`
  }

  override format () {
    const value = this.rawValue as string
    const d = Object.assign(document.createElement('div'), { style: `color:${value}` })
    document.body.append(d)
    const m = window.getComputedStyle(d).color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    d.remove()
    if (m) return `${m[1]} ${m[2]} ${m[3]}`
    if (value.startsWith('#')) {
      const [r, g, b] = value.slice(1).match(/.{1,2}/g)!.map(h => parseInt(h.length>1?h:h+h, 16))
      if ([r, g, b].every(n => !isNaN(n))) return `${r} ${g} ${b}`
    }
    return value.toLowerCase()==='transparent' ? 'transparent' : value
  }
}