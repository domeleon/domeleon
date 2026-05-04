import { maskitoNumberOptionsGenerator, type MaskitoNumberParams, maskitoParseNumber } from '@maskito/kit'
import { type MaskitoPlugin, type MaskitoPreprocessor } from '@maskito/core'
import { type DataBindProps, type VAttributes } from 'domeleon'
import { inputMask } from './inputMask.js'

export type InputNumberProps = DataBindProps<number | undefined> &
{
  attrs?: VAttributes
  numberParams?: MaskitoNumberParams
  plugins?: MaskitoPlugin[]
}

// Mirror @maskito/kit defaults (CHAR_NO_BREAK_SPACE / CHAR_MINUS).
const DEFAULT_THOUSAND_SEPARATOR = ' '
const DEFAULT_MINUS_SIGN = '−'

export function inputNumber(props: InputNumberProps)
{
  const { numberParams: numberParamsFromProps, plugins, ...coreMaskitoOptions } = props
  const numberParamsForGenerator = { ...(numberParamsFromProps || {}) }
  const genOptions = maskitoNumberOptionsGenerator(numberParamsForGenerator)
  const combinedPlugins = [ ...(genOptions.plugins || []), ...(plugins || []) ]

  // Strip characters that aren't part of the configured locale's number format
  // before maskito processes a paste. Lets users paste "1,000,000" into a default
  // (NBSP-separator) field; cross-locale paste (e.g. German "1.000,50" into a US
  // field) is intentionally not auto-detected and will not parse cleanly.
  const decimalSep = numberParamsForGenerator.decimalSeparator ?? '.'
  const thousandSep = numberParamsForGenerator.thousandSeparator ?? DEFAULT_THOUSAND_SEPARATOR
  const minusSign = numberParamsForGenerator.minusSign ?? DEFAULT_MINUS_SIGN
  const allowed = new Set(['0','1','2','3','4','5','6','7','8','9', decimalSep, thousandSep, minusSign, '-'])
  const stripForeignSeparators: MaskitoPreprocessor = (state, actionType) => {
    if (actionType !== 'insert') return state
    let cleaned = ''
    for (const c of state.data) if (allowed.has(c)) cleaned += c
    return cleaned === state.data ? state : { elementState: state.elementState, data: cleaned }
  }

  return inputMask({
    ...coreMaskitoOptions,
    maskitoOptions: {
      ...genOptions,
      plugins: combinedPlugins,
      preprocessors: [stripForeignSeparators, ...(genOptions.preprocessors || [])]
    },
    converter: {
      format: val => val == null ? "" : "" + val,
      parse: str => {
        const num = maskitoParseNumber(str, numberParamsForGenerator)
        return Number.isNaN(num) ? undefined : num
      }
    }
  })
}
