import { Component } from '../component/component.js'
import { type UpdateEvent } from '../component/componentTypes.js'
import { getPropertyKey, type PropertyRef } from './componentBinding.js'
import { type IValidated, type ValidatorEvent, type ValidationState, type ValidatorError} from './validationTypes.js'

export function isValidated (c: Component): c is Component & IValidated {
  return c instanceof Component &&
    (c as unknown as IValidated).validator instanceof Validator
}

export abstract class Validator {
  #form: Component & IValidated
  #errors?: ValidatorError[]
  #runToken = 0
  #asyncInProgress = false
  #syncErrors: ValidatorError[] = []
  #asyncErrors: ValidatorError[] = []

  constructor(form: Component & IValidated) {
    this.#form = form
  }

  protected abstract validateSync(form: Component & IValidated): ValidatorError[]

  #validateSyncWrapper(): boolean {
    this.#syncErrors = this.validateSync(this.#form)
    this.#mergeErrors()
    for (const c of this.#children()) c.validator.#validateSyncWrapper()
    return this.#isValid
  }

  async validate(): Promise<boolean> {
    const token = ++this.#runToken
    this.#asyncInProgress = true
    const syncOK = this.#validateSyncWrapper()
    this.#fireUpdate(false)    
    await this.#validateAsync(token)

    if (token === this.#runToken) {
      this.#asyncInProgress = false
      this.#fireUpdate(true)
    }
    return this.#isValid
  }

  #fireUpdate(async: boolean) {
    this.#form.update(<ValidatorEvent>{ cause: 'validator', async, validationState: this.state })
  }

  revalidate(evt: UpdateEvent): Promise<boolean> {
    return (evt.cause === 'validator' || !this.#wasValidated)    
      ? Promise.resolve(false)
      : this.validate()
  }

  async #validateAsync(token: number) {
    const tasks: Promise<unknown>[] = []

    tasks.push(
      this.#form.onValidate().then(errs => {
        if (token !== this.#runToken) return
        this.#asyncErrors = errs
        this.#mergeErrors()
      })
    )

    for (const c of this.#children())
      tasks.push(c.validator.validate())

    await Promise.all(tasks)
  }

  #mergeErrors() {
    const map = new Map<string, ValidatorError>()
    const add = (err: ValidatorError) => {
      const existing = map.get(err.property)
      if (existing) {
        existing.messages = Array.from(new Set([...existing.messages, ...err.messages]))
        if (err.value !== undefined) existing.value = err.value
      }
      else {        
        map.set(err.property, { ...err, messages: [...err.messages] })
      }
    }
    this.#syncErrors.forEach(add)
    this.#asyncErrors.forEach(add)
    this.#errors = Array.from(map.values())
  }

  #children(): IValidated[] {
    return this.#form.ctx.children.filter(isValidated)
  }

  getError<T>(prop: PropertyRef<T>) {
    return this.#errors?.find(e => e.property === getPropertyKey(prop))
  }

  get #isValid(): boolean {
    return !this.#errors?.length &&
      this.#children().every(v => v.validator.#isValid)
  }

  get #isSettled(): boolean {
    return !this.#asyncInProgress &&
      this.#children().every(v => v.validator.#isSettled)
  }

  get #wasValidated(): boolean {
    return this.#errors != null &&
      this.#children().every(v => v.validator.#wasValidated)
  }

  get state(): ValidationState {
    if (! this.#wasValidated) return "unvalidated"
    if (! this.#isValid) return "invalid"
    if (! this.#isSettled) return "validating"
    return "valid"
  }

  clearErrors() {
    this.#syncErrors = []
    this.#asyncErrors = []
    this.#errors = undefined
    this.#children().forEach(v => v.validator.clearErrors())
  }
}