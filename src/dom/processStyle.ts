import type { JSX } from 'preact'

export class StyleProcessor {
  styles?: JSX.CSSProperties

  addStyle(value?: JSX.CSSProperties) {
    if (isStyleObject(value)) {
      this.styles ??= {}
      Object.assign(this.styles, value)
    }
  }
}

const isStyleObject = (value: any): value is JSX.CSSProperties => {
  return typeof value === 'object' && 
         value !== null &&
         !Array.isArray(value) && 
         !(value instanceof Date)
}