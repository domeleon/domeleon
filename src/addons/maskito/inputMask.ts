import { Maskito, maskitoTransform, type MaskitoOptions } from '@maskito/core'
import { type VAttributes, input, mergeAttrs, getPropertyValue, setPropertyValue, type DataBindProps } from 'domeleon'

/**
 * Defines functions to convert data between a component's model value (type T)
 * and the string representation used in an input element, suitable for
 * consumption by an input masking library.
 */
export interface MaskValueConverter<T> {
  /**
   * Converts the model value of type T to an initial string representation.
   * This string is intended as the base input for a masking library.
   */
  format: (modelValue: T) => string;

  /**
   * Converts the string value from the (potentially masked) input element
   * back to the model type T.
   */
  parse: (inputValue: string, currentModelValue?: T) => T;
}

export type InputMaskProps<PropType> = DataBindProps<PropType> &
{
  id?: string
  inputAttrs?: VAttributes
  maskitoOptions: MaskitoOptions
  converter: MaskValueConverter<PropType>
}

export function inputMask<PropType>(props: InputMaskProps<PropType>)
{
  const { id, target, prop, maskitoOptions, inputAttrs, converter } = props

  return input({
    type: inputAttrs?.type ?? 'text',
    ...mergeAttrs({ id: id }, inputAttrs),
    onInput: event => {
      const elm = event.target as HTMLInputElement
      setPropertyValue(target, prop, converter.parse(elm.value, getPropertyValue(target, prop)))
    },
    onMounted: elm => {
      const inputElement = elm as HTMLInputElement
      inputElement.value = maskitoTransform(converter.format(getPropertyValue(target, prop)), maskitoOptions)
      const mask = new Maskito(inputElement, maskitoOptions)
      return () => mask.destroy()
    }
  })
} 