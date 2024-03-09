import type { AbstractConstructor, Constructor } from './generics'
import { injectable, singleton } from './injection'

export interface implementationConfig<T> {
  base?: Constructor<T> | AbstractConstructor<T>
  singleton?: true
}

export function implementation<T>(config?: implementationConfig<T>) {
  return <P extends T>(constructor: Constructor<P>) => {
    constructor.prototype.__config__ = function __config__() {
      return config ?? {}
    }

    if (config?.singleton) singleton()(constructor)
    else injectable()(constructor)
  }
}
