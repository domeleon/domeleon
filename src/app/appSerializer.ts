import { Component } from '../component/component.js'
import { LocalStorageSerializer } from './appStorage.js'

export interface PersisterHost {
  id: string
  root: Component
  refresh(): void  
  autoPersist: boolean
}

export class AppSerializer {
  private readonly _host: PersisterHost
  private readonly _localStorage: LocalStorageSerializer  

  constructor(host: PersisterHost) {
    this._host = host    
    this._localStorage = this.createStorage()    
    if (this._host.autoPersist) {
      this._localStorage.load()
    }
  }

  private serialize() {
    return this._host.root.serializer.serialize()
  }

  private deserialize(state: any) {
    this._host.root.serializer.deserialize(state)
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

  private createStorage() {
    return new LocalStorageSerializer({
      key: this._host.id,
      serialize: () => JSON.stringify(this.serialize()),
      deserialize: state => this.deserialize(JSON.parse(state))      
    })
  }
}