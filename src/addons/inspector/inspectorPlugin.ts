import type { AppPlugin } from '../../app/appPlugin.js'
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