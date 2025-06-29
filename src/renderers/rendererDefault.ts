import * as preact from 'preact'
import * as preactHooks from 'preact/hooks'
import { PreactRenderer } from './preact/index.js'

export const createDefaultRenderer = () => {
  return new PreactRenderer({
    PreactLib: preact,
    PreactHooksLib: preactHooks
  })
}
