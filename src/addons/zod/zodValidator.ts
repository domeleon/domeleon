// zodValidationAdapter.ts
import { Validator, type IValidated, Component } from '../../index.js'
import type { ZodType } from 'zod'

export class ZodValidator<T extends object> extends Validator {
  schema: ZodType<T>
  
  constructor(form: Component & IValidated, schema: ZodType<T>) {
    super(form)
    this.schema = schema
  }

  protected validateSync(form: Component & IValidated) {
    const parsed = this.schema.safeParse(form)
    if (parsed.success) return []

    /* 1 — group all issues by top-level property */
    const buckets: Record<string, {
      msgs: string[]
      val: any
    }> = {}

    parsed.error.issues.forEach(issue => {
      const key = issue.path.length ? issue.path[0] as string : '_form'
      const slot = buckets[key] ??= {
        msgs: [],
        val : (form as any)[key],
      }
      slot.msgs.push(issue.message)
    })

    /* 2 — convert to Domeleon's shape */
    return Object.entries(buckets).map(([property, { msgs, val }]) => ({
      property,
      messages: msgs,
      value   : val,
    }))
  }
}