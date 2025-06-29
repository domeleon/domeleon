import { getPropertyValue, setPropertyValue, type PropertyRef } from './componentBinding.js'
import { Component } from '../component/component.js'
import { fuzzyEquals, parseFloatDeNaN } from '../util.js'

function typeify<T> (guide: T, input: string): T {
  if (typeof guide == 'number') return <any>parseFloatDeNaN(input)
  if (typeof guide == 'boolean') return <any>(input == 'true')
  if (typeof guide == 'string') return <any>input
  return <any>null 
}

export function bindValue<PropType extends string | undefined>(
  target: Component,
  prop: PropertyRef<PropType>
) {
  return {
    value: String(getPropertyValue(target, prop) ?? ""), // Ensure string
    onInput: (e: Event) => setPropertyValue(target, prop, (e.target as HTMLInputElement).value as PropType)
  }
}

export function bindRangeValue<T extends number | undefined>(
  target: Component,
  prop: PropertyRef<T>
) {
  return {
    value: getPropertyValue(target, prop) as T,
    onInput: (ev: Event) => {            
      setPropertyValue(target, prop, (ev.target as HTMLInputElement).valueAsNumber as T)  
    }
  }
}

interface BindRadioChoices<T> { mode: 'radio'; elementValue: T }
interface BindSelectChoices<T> { mode: 'select'; guideValue?: T }
export type BindChoices<T> = BindRadioChoices<T> | BindSelectChoices<T>

export function bindChoice<T extends string | number | boolean | undefined>(
  target: Component,
  prop: PropertyRef<T>,
  options: BindChoices<T>
) {
  const modelValue = getPropertyValue(target, prop)
  const valueAttr = String(options.mode === 'radio' ? options.elementValue ?? '' : modelValue ?? '')
  const isChecked = options.mode === 'radio' ? fuzzyEquals(modelValue, options.elementValue) : false
  
  return {
    value: valueAttr,
    checked: isChecked,
    onChange: (e: Event) => {
      const element = e.target as HTMLInputElement | HTMLSelectElement
      if (options.mode === 'select' || (element as HTMLInputElement).checked) {
        const typeGuide = options.mode === 'radio'
          ? options.elementValue ?? ""
          : options.guideValue ?? modelValue ?? ""
        setPropertyValue(target, prop, typeify(typeGuide, element.value) as T)
      }
    }
  }
}

export function bindChecked(target: Component, prop: PropertyRef<boolean>) {
  return {
    checked: getPropertyValue(target, prop) ?? false,
    onChange: (e: Event) => setPropertyValue(target, prop, (e.target as HTMLInputElement).checked)
  }
}

export interface Flag {
  key: string
  value: boolean
  label?: string    
}

export function bindCheckedFlag(target: Component, prop: PropertyRef<Flag[]>, flagKey: string) {
  return ({
    checked: getPropertyValue(target, prop).find(i => i.key === flagKey)!.value,
    onChange: (e: Event) => {
      const elm = e.target as HTMLInputElement
      setPropertyValue(target, prop,
        getPropertyValue(target, prop).map(item =>
          item.key === flagKey ? { ...item, value: elm.checked } : item
        )
      )
    }
  })
}