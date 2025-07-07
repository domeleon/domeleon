import type { AppPlugin, UpdateEvent } from 'domeleon'
import { Inspector } from './inspector.js'

export const inspector: AppPlugin<Inspector> = {
  create(app) {
    return new Inspector(app)
  },
  onUpdated(inspector, evt: UpdateEvent) {
    inspector.recordUpdate(evt)
  }
}