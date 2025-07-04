import { Component } from '../component/component.js'
import { getLabel, getPropertyKey, type PropertyRef } from './componentBinding.js'
import type { VAttributes, VElement } from '../dom/dom.js'
import { type HValues } from '../dom/html.js'
import { div, label, fieldset, legend } from '../dom/htmlGenElements.js'
import type { DataBindProps } from './componentBinding.js'
import { getInputMetadata } from './inputMetadata.js'

export type InputFn<
  T,
  P extends DataBindProps<T> = DataBindProps<T>
> = (props: P) => VElement

export type InputValueFrom<F> = F extends InputFn<infer T, any> ? T : never
export type InputPropsFrom<F> = F extends InputFn<any, infer P> ? P : never

/**
 * Creates a complete form field, typically consisting of a label, an input control, 
 * an optional description, and an optional validation message area.
 * This high-level utility wraps an `InputFn` (like `inputText`, `inputSelect`, etc.) 
 * to provide a consistent and accessible form field structure.
 *
 * Key benefits include:
 * - **Automatic label generation**: If a `label` prop is not provided, a user-friendly label 
 *   is generated from the bound property's name or getLabels() on the component if available.
 *   Same for description.
 * - **Unique ID Generation**: Automatically generates and associates unique IDs for the input 
 *   element, its label (`for` attribute), and any description or validation messages 
 *   (`aria-describedby`), ensuring correct HTML semantics and accessibility links.
 * - **Integrated Validation Display**: If the `target` component uses Domeleon's validation 
 *   system (`IValidated` and `Validator`), `formField` automatically displays validation 
 *   messages and applies `data-validated` and `data-validation-state` attributes that you
 *   can style via the `validationAttrs` prop.
 * - **Automatic ARIA Attributes**: Relevant ARIA attributes (e.g., `aria-invalid`, `aria-describedby`) 
 *   are automatically applied to the input element based on its validation state, 
 *   enhancing accessibility with no manual effort.
 * - **Consistent HTML Structure**: Generates a predictable structure for each input* function,
 *   for inputs, selects, radios etc., where every node can be styled individually, 
 *   typically with *attrs {class: ...}. Outputs a structure compatible with all major css frameworks.
 */
export function formField<F extends InputFn<any, any>>(
  /** Configuration options for the form field. */
  props: {
    /** The component instance to which the input field will be bound. */
    target: Component
    /** 
     * A type-safe reference to the property on the `target` component that this field binds to. 
     * Example: `() => this.username`
     */
    prop: PropertyRef<InputValueFrom<F>>
    /** 
     * The input* function responsible for rendering the input control (e.g., `inputText`, `inputSelect`).
     */
    inputFn: F
    /** 
     * Props specific to the chosen `inputFn`, excluding the standard `DataBindProps` 
     * (`target`, `prop`, `id`) which are handled by `formField` itself.
     * Example: For `inputText`, this might include `inputAttrs`. For `inputSelect`, it might include `options`.
     */
    inputProps?: Omit<InputPropsFrom<F>, keyof DataBindProps<InputValueFrom<F>>>
    /** 
     * The text or HTML content for the field's label. 
     * If not provided, a friendly name is generated from the `prop` name.
     */
    label?: HValues
    /** Optional persistent supporting text displayed below the input. */
    description?: HValues
    /** Whether to show the label. Defaults to `true`. */
    showLabel?: boolean
    /** 
     * Whether to display validation messages. Defaults to `true`.
     * Works in conjunction with Domeleon's integrated validation system.
     */
    showValidation?: boolean
    /** HTML attributes for the main div that wraps the entire form field structure. */
    fieldAttrs?: VAttributes
    /** HTML attributes for the label element. */
    labelAttrs?: VAttributes
    /** HTML attributes for the validation message container, e.g. to make validation errors red. */
    validationAttrs?: VAttributes
    /** HTML attributes for the supporting text container. */
    descriptionAttrs?: VAttributes
    /** HTML attributes for the main control wrapper div that contains the input element. */
    controlAttrs?: VAttributes
    /** Optional VNodes inserted before the input element within the control wrapper. */
    inputPrefix?: VElement[]
    /** Optional VNodes inserted after the input element within the control wrapper. */
    inputSuffix?: VElement[]
  }
)
{
  const { target, prop, inputFn, inputProps, label: labelH, description, showLabel = true,    
    showValidation = true, fieldAttrs, labelAttrs, validationAttrs, descriptionAttrs,
    controlAttrs, inputPrefix, inputSuffix,
  } = props

  const bestLabel = labelH ?? getLabel(target, prop)
  const prefixedId = `${getPropertyKey(prop)}-${target.ctx.componentId}`

  const { validationFieldAttrs, validationInputAttrs, explanation } =
    getInputMetadata(target, prop, prefixedId, description, descriptionAttrs, showValidation, validationAttrs)

  const fieldAndValidationAttrs = { ...validationFieldAttrs, ...fieldAttrs }
  const rawInput = inputFn({ target, prop, id: prefixedId, ...inputProps })  

  if (rawInput.nodeName === 'div') {
    return div (fieldAndValidationAttrs,
      fieldset({
          ...controlAttrs,
          ...validationInputAttrs,
        },
        showLabel ? legend(labelAttrs, bestLabel) : undefined,        
        rawInput
      ),
      explanation
    )  
  }

  const inputEl: VElement = {
    ...rawInput,
    attributes: {      
      ...! showLabel ? { ariaLabel: getLabel(target, prop) } : undefined,
      ...validationInputAttrs,
      ...rawInput.attributes 
    }
  }
  const isCheckbox = inputEl.nodeName === 'input' && inputEl.attributes?.type === 'checkbox'
  const inputOrSelect = inputEl.nodeName === 'select' ? div(inputEl) : inputEl // necessary to overcome default select styling
  const children = [inputPrefix, inputOrSelect, inputSuffix]
  const labelAttrsWithFor = { for: prefixedId, ...labelAttrs }

  const controlContent = isCheckbox 
    ? label(labelAttrsWithFor, ...children, showLabel ? bestLabel : undefined)
    : children

  const externalLabel = isCheckbox ?
    undefined :
    showLabel ? label(labelAttrsWithFor, bestLabel) : undefined

  return div (fieldAndValidationAttrs,
    div ({ style: { position: "relative" } }, // for material design floating labels
      externalLabel,
      div (controlAttrs, controlContent)
    ),
    explanation
  )
}