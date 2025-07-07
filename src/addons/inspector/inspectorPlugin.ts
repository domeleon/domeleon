import type { AppPlugin } from '../../index.js'
import { Inspector } from './inspector.js'
import type { UpdateEvent } from '../../component/componentTypes.js'

export const inspector: AppPlugin<Inspector> = {
  create(app) {
    return new Inspector(app)
  },
  onUpdated(inspector, evt: UpdateEvent) {
    inspector.recordUpdate(evt)
  }
} 