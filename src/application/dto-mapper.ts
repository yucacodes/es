import { singleton } from '../injection'
import { type Constructor } from '../generics'
import { type Mapper } from '../mapper'

export interface dtoMapperConfig<M> {
  model: Constructor<M>
}

export function dtoMapper<M>(config: dtoMapperConfig<M>) {
  return <DTO>(constructor: Constructor<Mapper<M, DTO>>) => {
    constructor.prototype.__config__ = function __config__() {
      return config
    }
    singleton()(constructor)
  }
}
