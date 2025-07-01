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

  private _validateSyncWrapper(): boolean {
    this._syncErrors = this.validateSync(this._form)
    this._mergeErrors()
    for (const c of this._children()) c.validator._validateSyncWrapper()
    return this._isValid
  }

  async validate(): Promise<boolean> {
    const token = ++this._runToken
    this._asyncInProgress = true
    const syncOK = this._validateSyncWrapper()
    this._fireUpdate(false)    
    await this._validateAsync(token)

    if (token === this._runToken) {
      this._asyncInProgress = false
      this._fireUpdate(true)
    }
    return this._isValid
  }

  private _fireUpdate(async: boolean) {
    this._form.update(<ValidatorEvent>{ cause: 'validator', async, validationState: this.state })
  }

  revalidate(evt: UpdateEvent): Promise<boolean> {
    return (evt.cause === 'validator' || !this._wasValidated)    
      ? Promise.resolve(false)
      : this.validate()
  }

  private async _validateAsync(token: number) {
    const tasks: Promise<unknown>[] = []

    tasks.push(
      this._form.onValidate().then(errs => {
        if (token !== this._runToken) return
        this._asyncErrors = errs
        this._mergeErrors()
      })
    )

    for (const c of this._children())
      tasks.push(c.validator.validate())

    await Promise.all(tasks)
  }

  private _mergeErrors() {
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

  private _children(): IValidated[] {
    return this._form.ctx.children.filter(isValidated)
  }

  private getError<T>(prop: PropertyRef<T>) {
    return this._errors?.find(e => e.property === getPropertyKey(prop))
  }

  private get _isValid(): boolean {
    return !this._errors?.length &&
      this._children().every(v => v.validator._isValid)
  }

  private get _isSettled(): boolean {
    return !this._asyncInProgress &&
      this._children().every(v => v.validator._isSettled)
  }

  private get _wasValidated(): boolean {
    return this._errors != null &&
      this._children().every(v => v.validator._wasValidated)
  }

  get state(): ValidationState {
    if (! this._wasValidated) return "unvalidated"
    if (! this._isValid) return "invalid"
    if (! this._isSettled) return "validating"
    return "valid"
  }

  clearErrors() {
    this._syncErrors = []
    this._asyncErrors = []
    this._errors = undefined
    this._children().forEach(v => v.validator.clearErrors())
  }
}