export interface LocalStorageSerializerHost {
  key: string
  serialize: () => string
  deserialize: (state: string) => void
}

export class LocalStorageSerializer {
  #host: LocalStorageSerializerHost  

  constructor(host: LocalStorageSerializerHost) {
    this.#host = host    
  }

  load() {
    if (supported()) {
        this.#host.deserialize(window.localStorage.getItem(this.#host.key)!)      
    }
  }

  save() {
    if (supported()) {
      const obj = this.#host.serialize()
      window.localStorage.setItem(this.#host.key, obj)
    }
  }

  clear() {
    supported() &&
    window.localStorage.removeItem(this.#host.key)
  }
}

function supported() {
  return window.localStorage != null
}