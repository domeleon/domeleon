import type { UpdateEvent } from '../component/componentTypes.js'
import type { Validator } from './validator.js'

export type ValidationState = "unvalidated" | "validating" | "invalid" | "valid"

export interface IValidated {
  validator: Validator
  customValidatorErrors?() : Promise<ValidatorError[]>
}
export interface ValidatorError {
  property: string
  messages: string[]
  value?: any
}

export interface ValidatorEvent extends UpdateEvent {
  cause: "validator"
  async: boolean
  validationState: ValidationState
} 