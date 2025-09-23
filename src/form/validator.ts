import { Component } from '../component/component.js'
import { type UpdateEvent } from '../component/componentTypes.js'
import { getPropertyKey, type PropertyRef } from './componentBinding.js'
import { type IValidated, type ValidatorEvent, type ValidationState, type ValidatorError} from './validationTypes.js'

export function isValidated (c: Component): c is Component & IValidated {
  return c instanceof Component &&
    (c as unknown as IValidated).validator instanceof Validator
}

export abstract class Validator {
  private readonly _form: Component & IValidated
  private _errors?: ValidatorError[]
  private _runToken = 0
  private _asyncInProgress = false
  private _syncErrors: ValidatorError[] = []
  private _asyncErrors: ValidatorError[] = []

  constructor(form: Component & IValidated) {
    this._form = form
  }

  protected abstract validateSync(form: Component & IValidated): ValidatorError[]

  private validateSyncWrapper(): boolean {
    this._syncErrors = this.validateSync(this._form)
    this.mergeErrors()
    for (const c of this.children()) c.validator.validateSyncWrapper()
    return this.isValid
  }

  async validate(): Promise<boolean> {
    const token = ++this._runToken
    this._asyncInProgress = true
    const syncOK = this.validateSyncWrapper()
    this.fireUpdate(false)    
    await this.validateAsync(token)

    if (token === this._runToken) {
      this._asyncInProgress = false
      this.fireUpdate(true)
    }
    return this.isValid
  }

  private fireUpdate(async: boolean) {
    this._form.update(<ValidatorEvent>{ cause: 'validator', async, validationState: this.state })
  }

  revalidate(evt: UpdateEvent): Promise<boolean> {
    return (evt.cause === 'validator' || !this.wasValidated)    
      ? Promise.resolve(false)
      : this.validate()
  }

  private async validateAsync(token: number) {
    const tasks: Promise<unknown>[] = []

    tasks.push(
      this._form.onValidate().then(errs => {
        if (token !== this._runToken) return
        this._asyncErrors = errs
        this.mergeErrors()
      })
    )

    for (const c of this.children())
      tasks.push(c.validator.validate())

    await Promise.all(tasks)
  }

  private mergeErrors() {
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
    this._syncErrors.forEach(add)
    this._asyncErrors.forEach(add)
    this._errors = Array.from(map.values())
  }

  private children(): IValidated[] {
    return this._form.ctx.children.filter(isValidated)
  }

  getError<T>(prop: PropertyRef<T>) {
    return this._errors?.find(e => e.property === getPropertyKey(prop))
  }

  private get isValid(): boolean {
    return !this._errors?.length &&
      this.children().every(v => v.validator.isValid)
  }

  private get isSettled(): boolean {
    return !this._asyncInProgress &&
      this.children().every(v => v.validator.isSettled)
  }

  private get wasValidated(): boolean {
    return this._errors != null &&
      this.children().every(v => v.validator.wasValidated)
  }

  get state(): ValidationState {
    if (! this.wasValidated) return "unvalidated"
    if (! this.isValid) return "invalid"
    if (! this.isSettled) return "validating"
    return "valid"
  }

  clearErrors() {
    this._syncErrors = []
    this._asyncErrors = []
    this._errors = undefined
    this.children().forEach(v => v.validator.clearErrors())
  }
}