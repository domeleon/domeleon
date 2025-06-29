import { getPropertyValue } from './componentBinding.js'
import { bindChecked, bindChoice, bindRangeValue, bindValue, bindCheckedFlag, type Flag } from './formBinding.js'
import type { VAttributes, VElement } from '../dom/dom.js'
import { mergeAttrs, type HValues } from '../dom/html.js'
import { div, input, label, option, select, textarea } from '../dom/htmlGenElements.js'
import { fuzzyEquals } from '../util.js'
import type { DataBindProps } from './componentBinding.js'

// --- InputText ---

/** Props for the `inputText` function. */
export type InputTextProps<T extends string | undefined> = DataBindProps<T> & {
  /** HTML attributes to apply to the input element. */
  inputAttrs?: VAttributes
}

/**
 * Creates a standard text input element bound to a component property.
 * @param props Configuration for the text input.
 * @returns A VElement representing the text input.
 */
export function inputText<T extends string | undefined>(props: InputTextProps<T>) {
  const { id, target, prop, inputAttrs: attrs } = props
  return input({
    type: 'text',
    id,
    ...attrs,
    ...bindValue(target, prop)
  })
}

// --- TextArea ---

/** Props for the `inputTextArea` function. */
export type InputTextAreaProps<T extends string | undefined> = DataBindProps<T> & {
  /** HTML attributes to apply to the textarea element. */
  textAreaAttrs?: VAttributes
}

/**
 * Creates a textarea element bound to a component property.
 * @param props Configuration for the textarea.
 * @returns A VElement representing the textarea.
 */
export function inputTextArea<T extends string | undefined>(props: InputTextAreaProps<T>) {
  const { id, target, prop, textAreaAttrs: attrs } = props
  return textarea({
    id,
    ...attrs,
    ...bindValue(target, prop)
  })
}

// --- InputRange ---

/** Props for the `inputRange` function. */
export type InputRangeProps<T extends number> = DataBindProps<T> & {
  /** HTML attributes to apply to the range input element. */
  inputAttrs?: VAttributes
}

/**
 * Creates a range input element bound to a component property.
 * @param props Configuration for the range input.
 * @returns A VElement representing the range input.
 */
export function inputRange<T extends number>(props: InputRangeProps<T>) {
  const { id, target, prop, inputAttrs: attrs } = props
  return input({
    type: 'range',
    id,
    ...attrs,
    ...bindRangeValue(target, prop)
  })
}

// --- InputSelect (Single Select) ---

/** Defines the structure for an option in a select list. */
export type SelectOption<T> = { 
  /** The actual value of the option. */
  value: T, 
  /** The visible text label for the option. */
  label: string | number, 
  /** HTML attributes to apply to this specific option element. */
  optionAttrs?: VAttributes
}

/** Props for the `inputSelect` function, creating a single-select dropdown. */
export type InputSelectProps<T extends string | number | undefined> = DataBindProps<T> & {
  /** HTML attributes to apply to the select element itself. */
  selectAttrs?: VAttributes
  /** Array of `SelectOption` objects to populate the dropdown. */
  options?: SelectOption<T>[]
  /** 
   * An optional placeholder or empty option (e.g., "Select an item"). 
   * If provided, it's typically the first item in the list.
   */
  emptyOption?: Partial<SelectOption<T>>
  /** CSS class to apply to the currently selected option element. */
  selectedClass?: string
}

/**
 * Creates a single-select dropdown element bound to a component property.
 * @param props Configuration for the select input.
 * @returns A VElement representing the select input.
 */
export function inputSelect<T extends string | number | undefined>(props: InputSelectProps<T>) {
  const { id, target, prop, selectAttrs, options, emptyOption, selectedClass } = props
  const value = getPropertyValue(target, prop)
  
  // Provides a hint to bindChoice for its initial state or type inference if the actual value is initially undefined.
  const guideValueForBindChoice: T | undefined = value ?? options?.[0]?.value ?? emptyOption?.value
  
  const optionsIncludeEmpty = [emptyOption, ...(options ?? [])].filter(o => o !== undefined)
    
  return select(
    { 
      id,
      ...selectAttrs, 
      ...bindChoice(target, prop, { mode: 'select', guideValue: guideValueForBindChoice })
    },
    optionsIncludeEmpty.map(o =>
      option(
        mergeAttrs(
          { 
            value: String(o.value ?? ''), 
            class: fuzzyEquals(o.value, value) ? selectedClass : undefined 
          },
          o.optionAttrs 
        ),
        o.label
      )
    )
  )
}

// --- InputRadioGroup ---

/** Defines the structure for an option within a radio button group. */
export interface RadioOption<T> {
  /** The actual value associated with this radio option. */
  value: T,
  /** The visible label for this radio option. Can be simple text or complex HTML elements. */
  label: HValues,
  /** HTML attributes to apply to the radio input element itself. */
  inputAttrs?: VAttributes,   
  /** HTML attributes to apply to the label element associated with this radio input. */
  labelAttrs?: VAttributes    /** HTML attributes for the div that wraps this individual radio input and its label. */
}

/** Props for the `inputRadioGroup` function. */
export type InputRadioGroupProps<T> = DataBindProps<T> & {
  /** HTML attributes for the main div that wraps all radio options. */
  wrapperAttrs?: VAttributes,
  /** Array of `RadioOption` objects to create the radio buttons. */
  options?: RadioOption<T>[],
  /** CSS class to apply to the currently selected radio option. */
  selectedClass?: string 
}

/**
 * Creates a group of radio buttons bound to a component property.
 * Each radio option is wrapped in its own div, and the entire group is also wrapped in a div.
 * @param props Configuration for the radio button group.
 * @returns A VElement representing the radio button group.
 */
export function inputRadioGroup<T extends string | number | undefined> (props: InputRadioGroupProps<T>)
{
  const { id, target, prop, wrapperAttrs, options = [], selectedClass } = props
  
  return div(wrapperAttrs,
    options.map(option => {
      const optionValueStr = String(option.value) 
      const optionId = `${id}-${optionValueStr}`      
      const checked = fuzzyEquals(getPropertyValue(target, prop), option.value)
      const inputElementAttrs = { id: optionId, name: id, ...option.inputAttrs}
      
      return label( option.labelAttrs,
        input({
          class: checked ? selectedClass : undefined,
          type: "radio",
          ...inputElementAttrs,          
          ...bindChoice (target, prop, { mode: 'radio', elementValue: option.value }) 
        }),
        option.label        
      )
    })
  )
}

// --- InputCheckbox ---

/** Props for the `inputCheckbox` function. */
export type InputCheckboxProps<T extends boolean> = DataBindProps<T> & {
  /** HTML attributes to apply to the checkbox input element. */
  inputAttrs?: VAttributes
}

/**
 * Creates a single checkbox input element bound to a boolean component property.
 * @param props Configuration for the checkbox input.
 * @returns A VElement representing the checkbox input.
 */
export function inputCheckbox<T extends boolean>(props: InputCheckboxProps<T>) {
  const { id: checkboxId, target, prop, inputAttrs: attrs } = props
  
  return input({
    type: 'checkbox',
    id: checkboxId,
    ...attrs,
    ...bindChecked(target, prop)
  })
}

// --- InputCheckboxGroup ---

/** Defines the structure for an option within a checkbox group. */
export interface CheckboxOption {
  /** 
   * Unique key for this checkbox, corresponding to `Flag.key`.
   * Used for binding its checked state within the `Flag[]` array.
   */
  key: string 
  /** The visible label for this checkbox option. */
  label: HValues
  /** HTML attributes for the checkbox input element itself. */
  inputAttrs?: VAttributes
  /** HTML attributes for the label associated with this checkbox. */
  labelAttrs?: VAttributes
}

/** 
 * Props for the `inputCheckboxGroup` function.
 * This component binds to an array of `Flag` objects.
 */
export interface InputCheckboxGroupProps extends DataBindProps<Flag[]> {
  /** HTML attributes for the main div that wraps all checkbox options. */
  wrapperAttrs?: VAttributes
  /** Array of `CheckboxOption` objects to create the checkboxes. */
  options: CheckboxOption[]
}

/**
 * Creates a group of checkboxes, where each checkbox corresponds to a `Flag` in an array on the component.
 * Each checkbox option is wrapped in its own div, and the entire group is also wrapped in a div.
 * @param props Configuration for the checkbox group.
 * @returns A VElement representing the checkbox group.
 */
export function inputCheckboxGroup(props: InputCheckboxGroupProps): VElement {
  const { id, target, prop, wrapperAttrs, options } = props

  return div({ id, ...wrapperAttrs},
    options.map((option, index) => {
      // Binds to a specific Flag object in the array via its key.
      const checkboxBinding = bindCheckedFlag(target, prop, option.key)
      const inputId = `${id}-${option.key}-${index}`

      return label(option.labelAttrs,
        input({
          type: "checkbox",
          id: inputId,
          ...option.inputAttrs,
          ...checkboxBinding
        }),
          option.label        
      )
    })
  )
}