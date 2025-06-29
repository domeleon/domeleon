import { Component } from '../component/component.js'
import { LocalStorageSerializer } from './appStorage.js'

export interface PersisterHost {
  containerId: string
  rootComponent: Component
  refresh(): void  
  autoPersist: boolean
}

export class AppSerializer {
  #host: PersisterHost
  #localStorage: LocalStorageSerializer  

  constructor(host: PersisterHost) {
    this.#host = host    
    this.#localStorage = this.#createStorage()    
    if (this.#host.autoPersist) {
      this.#localStorage.load()
    }
  }

  #serialize() {
    return this.#host.rootComponent.serializer.serialize()
  }

  #deserialize(state: any) {
    this.#host.rootComponent.serializer.deserialize(state)
    this.#host.refresh()
  }  

  load() {
    this.#localStorage.load()    
  }

  save() {
    this.#localStorage.save()
  }

  clear() {
    this.#localStorage.clear()
  }

  #createStorage() {
    return new LocalStorageSerializer({
      key: this.#host.containerId,
      serialize: () => JSON.stringify(this.#serialize()),
      deserialize: state => this.#deserialize(JSON.parse(state))      
    })
  }
}