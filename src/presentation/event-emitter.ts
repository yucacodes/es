import { type Mapper } from '../mapper'
import { type Constructor } from '../generics'

export type InlineEventEmitterConfig<M, DTO> = {
  model: Constructor<M>
  event: string
  mapper: Constructor<Mapper<M, DTO>>
}

export type EmitterConfig = InlineEventEmitterConfig<unknown, unknown>
