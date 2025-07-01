export interface LocalStorageSerializerHost {
  key: string
  serialize: () => string
  deserialize: (state: string) => void
}

export class LocalStorageSerializer {
  private readonly _host: LocalStorageSerializerHost  

  constructor(host: LocalStorageSerializerHost) {
    this._host = host    
  }

  load() {
    if (supported()) {
        this._host.deserialize(window.localStorage.getItem(this._host.key)!)      
    }
  }

  save() {
    if (supported()) {
      const obj = this._host.serialize()
      window.localStorage.setItem(this._host.key, obj)
    }
  }

  clear() {
    supported() &&
    window.localStorage.removeItem(this._host.key)
  }
}

function supported() {
  return window.localStorage != null
}