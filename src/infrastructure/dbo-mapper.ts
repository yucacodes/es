import { type Constructor } from '../generics'
import { singleton } from '../injection'
import { CollectionsMapper } from '../mapper'

export type DboMapper<M, DBO> = {
  map(model: M): DBO
  revert(dbo: DBO): M
}

export abstract class DboCollectionsMapper extends CollectionsMapper {
  revertMap<M, DBO>(dboMap: { [key: string]: DBO }): Map<string, M> {
    return new Map(
      Object.keys(dboMap).map((key) => [key, (this as any).revert(dboMap[key])])
    )
  }

  revertArray<M, DBO>(dbos: DBO[]): M[] {
    return dbos.map((x) => (this as any).revert(x))
  }
}

export interface dboMapperConfig<M> {
  model: Constructor<M>
}

export function dboMapper<M>(config: dboMapperConfig<M>) {
  return <DBO>(constructor: Constructor<DboMapper<M, DBO>>) => {
    constructor.prototype.__config__ = function __config__() {
      return config
    }
    singleton()(constructor)
  }
}
