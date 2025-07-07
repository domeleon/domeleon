import type { UpdateEvent, ValidatorEvent, RouterEvent, InputEvent, SerializerEvent, UpdateCause } from 'domeleon'
import type { CssVar } from 'domeleon/unocss'
import { themeMgr } from '../theme/inspectorTheme.js'

const colors = themeMgr.theme.colors

type InspectorEventHandler<T extends UpdateEvent> = {
  values?: (event: T) => object   
  color: (event: T, key?: string) => CssVar | undefined
}

const inputEventHandler: InspectorEventHandler<InputEvent> = {
  color: () => colors.input
}

const routerEventHandler: InspectorEventHandler<RouterEvent> = {
  color: () => colors.router
}

const serializerEventHandler: InspectorEventHandler<SerializerEvent> = {
  color: () => colors.serializer
}

const validatorEventHandler: InspectorEventHandler<ValidatorEvent> = {
  values: ev => ({
    async: ev.async,
    validationState: ev.validationState
  }),
  color: (event, key) =>
    key == 'validationState' && event.validationState === 'valid' ? colors.valid :
    key == 'validationState' && event.validationState === 'invalid' ? colors.invalid :
    colors.validating
}

export const handlerFor = (cause?: string|UpdateCause): InspectorEventHandler<UpdateEvent> | undefined => {
  switch (cause) {
    case "validator": return validatorEventHandler as InspectorEventHandler<UpdateEvent>
    case "router": return routerEventHandler as InspectorEventHandler<UpdateEvent>
    case "input": return inputEventHandler as InspectorEventHandler<UpdateEvent>
    case "serializer": return serializerEventHandler as InspectorEventHandler<UpdateEvent>
    default: return undefined
  }
}