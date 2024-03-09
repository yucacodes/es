import { singleton } from '../injection'
import { type Constructor } from '../generics'
import { type Mapper } from '../mapper'

export interface DtoAutoMapperConfig {
  modelMappers: Map<Function, Mapper<any, any>>
}

const commonModelMappers = new Map()

const autoMapperConfigsStack: DtoAutoMapperConfig[] = [
  { modelMappers: commonModelMappers },
]

export class AutoMapper {
  private __config__(): DtoAutoMapperConfig {
    throw new Error(
      'Should use @dtoAutoMapper decorator for config AutoMapper '
    )
  }

  map<DTO = any, M = any>(model: M): DTO {
    if (this.constructor != AutoMapper) {
      autoMapperConfigsStack.push(this.__config__())
    }
    const out = this._map(model, autoMapperConfigsStack.at(-1)!.modelMappers)
    if (this.constructor != AutoMapper) {
      autoMapperConfigsStack.pop()
    }
    return out
  }

  private _map(model: any, modelMappers: Map<Function, Mapper<any, any>>): any {
    if (model === null) return null
    const type = typeof model
    if (
      type === 'string' ||
      type === 'number' ||
      type === 'boolean' ||
      type === 'undefined' ||
      type === 'bigint'
    ) {
      return model
    } else if (type === 'object') {
      return this.mapObject(model, modelMappers)
    } else {
      throw new Error(`Automapper not support map ${type} types`)
    }
  }

  private mapObject(model: any, modelMappers: Map<Function, Mapper<any, any>>) {
    if (Array.isArray(model)) {
      return model.map((x) => this._map(x, modelMappers))
    }
    const modelHierarchy = this.hierarchy(model)
    if (modelHierarchy.length === 0) {
      return Object.keys(model).reduce((acc, key) => {
        acc[key] = this._map(model[key], modelMappers)
        return acc
      }, {} as any)
    }
    for (const ctor of modelHierarchy) {
      const mapper = modelMappers.get(ctor)
      if (mapper) {
        return mapper.map(model)
      }
    }
    throw new Error(`Not found mapper for model '${model.constructor.name}' `)
  }

  private hierarchy(obj: any) {
    if (obj.constructor === Object) return []
    const out = [obj.constructor]

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
    while (true) {
      const parent = Object.getPrototypeOf(out.at(-1))
      if (!parent.name) break
      out.push(parent)
    }
    return out.filter((x) => x != Object)
  }
}

export type autoMapperConfig = Constructor<Mapper<any, any>>[]

export function autoMapper(config: autoMapperConfig) {
  return (constructor: Constructor<AutoMapper>) => {
    const mappersMap = new Map(
      config.map((x) => [x.prototype.__config__().model, x])
    )
    constructor.prototype.__config__ = function __config__() {
      return {
        mappersMap,
      }
    }
    singleton()(constructor)
  }
}
