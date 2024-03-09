export type Mapper<M, DTO> = {
  map(model: M): DTO
}

export class CollectionsMapper {
  mapMap<M, DTO>(map: Map<string, M>): { [key: string]: DTO } {
    const result: {
      [key: string]: DTO
    } = {}
    for (const [key, obj] of map.entries()) result[key] = (this as any).map(obj)
    return result
  }

  mapArray<M, DTO>(array: M[]): DTO[] {
    return array.map((x) => (this as any).map(x))
  }
}
