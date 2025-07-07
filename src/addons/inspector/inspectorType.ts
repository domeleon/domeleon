import type { UpdateCause } from 'domeleon'

export interface InspectorSettings {
  hideEmptyValues: boolean
  maxTextLength: number
  autoOpenDepth: number
  maxEvents: number  
}

export interface IInspector {  
  settings: InspectorSettings
  isVisible: boolean
}

export const defaultInspectorSettings: InspectorSettings = {
  hideEmptyValues: true,
  maxTextLength: 60,
  autoOpenDepth: 1,
  maxEvents: 100
}

export interface LoggedEvent {
  compName: string           
  compType: string         
  depth: number            
  changes: Array<{ key: string; newValue: string }>
  cause?: UpdateCause | string
  key?: string
  value?: string  
  timestamp: number    
}