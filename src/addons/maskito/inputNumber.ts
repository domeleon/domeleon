import { inputMask } from './inputMask.js'
import { maskitoNumberOptionsGenerator, type MaskitoNumberParams, maskitoParseNumber } from '@maskito/kit'
import { type MaskitoPlugin } from '@maskito/core'
import { type DataBindProps, type VAttributes } from '../../index.js'

export type InputNumberProps = DataBindProps<number | undefined> &
{
  inputAttrs?: VAttributes
  numberParams?: MaskitoNumberParams
  plugins?: MaskitoPlugin[]
}

export function inputNumber(props: InputNumberProps)
{
  const { numberParams: numberParamsFromProps, plugins, ...coreMaskitoOptions } = props
  const numberParamsForGenerator = { ...(numberParamsFromProps || {}) }    
  const genOptions = maskitoNumberOptionsGenerator(numberParamsForGenerator)
  const combinedPlugins = [ ...(genOptions.plugins || []), ...(plugins || []) ]

  return inputMask({
    ...coreMaskitoOptions,
    maskitoOptions: { ...genOptions, plugins: combinedPlugins },
    converter: {
      format: val => val == null ? "" : "" + val,
      parse: str => {
        const num = maskitoParseNumber(str, numberParamsForGenerator.decimalSeparator || '.')
        return Number.isNaN(num) ? undefined : num
      }
    }
  })
} 