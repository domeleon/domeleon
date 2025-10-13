import type { Component } from '../component/component.js'
import type { VAttributes } from '../dom/dom.js'
import { div, p } from '../dom/htmlGenElements.js'
import type { ValidatorError } from './validationTypes.js'
import { isValidated } from './validator.js'
import { type PropertyRef } from '../util.js'
import { getDescription } from './componentBinding.js'
import { type HValues } from '../dom/html.js'

const validationMessage = (
  messages?: string[],
  messagesId?: string,
  attrs?: VAttributes
) => 
  ! messages?.length ? undefined :
  div({ ...attrs, id: messagesId, role: 'alert' },
    ...messages.map(m => p(m))
  )

const dataValidationAttrs = (isValidated: boolean, error: ValidatorError | undefined) =>
  <VAttributes> {
    'data-validated': isValidated ? "true" : undefined,
    'data-validation-state': error?.messages.length ? "invalid" : "valid"
  }

const ariaValidationAttrs = (error: ValidatorError | undefined, messagesId: string) =>
  <VAttributes>{
    ariaInvalid: error?.messages.length ? "true" : undefined,
    ariaDescribedBy: messagesId    
  }

const hasBeenValidated = (component: Component) =>
  isValidated(component) && component.validator.state !== "unvalidated"

export const getInputMetadata = (
  target: Component,
  prop: PropertyRef<unknown>,
  qualifiedId: string,
  description?: HValues,
  descriptionAttrs?: VAttributes,
  showValidation = true,
  validationAttrs?: VAttributes  
) =>
{
  const validationId = `${qualifiedId}-messages`

  const bestDescription = description ?? getDescription(target, prop)
  const descriptionId = bestDescription ? `${qualifiedId}-description` : undefined
  const descriptionDiv = bestDescription && div({ ...descriptionAttrs, id: descriptionId }, bestDescription)

  const error = isValidated(target) ? target.validator.getError(prop) : undefined
  const validationFieldAttrs = dataValidationAttrs(hasBeenValidated(target), error)
  const ariaAttrs = ariaValidationAttrs(error, validationId)

  const validationInputAttrs: VAttributes = {
    ...ariaAttrs,
    ariaDescribedBy: [ariaAttrs.ariaDescribedBy, descriptionId]
      .filter(Boolean)
      .join(" ") || undefined
  }

  const validationMessageEl =
    showValidation && error?.messages.length
      ? validationMessage(error.messages, validationId, validationAttrs)
      : undefined

  const explanation = validationMessageEl || descriptionDiv

  return {
    validationFieldAttrs,
    validationInputAttrs,
    explanation    
  }
}