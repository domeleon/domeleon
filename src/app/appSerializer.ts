import { Component } from '../component/component.js'
import { LocalStorageSerializer } from './appStorage.js'

export interface PersisterHost {
  containerId: string
  rootComponent: Component
  refresh(): void  
  autoPersist: boolean
}

export class AppSerializer {
  private readonly _host: PersisterHost
  private readonly _localStorage: LocalStorageSerializer  

  constructor(host: PersisterHost) {
    this._host = host    
    this._localStorage = this._createStorage()    
    if (this._host.autoPersist) {
      this._localStorage.load()
    }
  }

  private _serialize() {
    return this._host.rootComponent.serializer.serialize()
  }

  private _deserialize(state: any) {
    this._host.rootComponent.serializer.deserialize(state)
    this._host.refresh()
  }  

  load() {
    this._localStorage.load()    
  }

  save() {
    this._localStorage.save()
  }

  clear() {
    this._localStorage.clear()
  }

  private _createStorage() {
    return new LocalStorageSerializer({
      key: this._host.containerId,
      serialize: () => JSON.stringify(this._serialize()),
      deserialize: state => this._deserialize(JSON.parse(state))      
    })
  }
}