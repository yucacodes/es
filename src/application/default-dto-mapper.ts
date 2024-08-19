import { autoMapper, AutoMapper } from './auto-mapper'
import { DateToISOStringMapper } from './mappers'

@autoMapper([DateToISOStringMapper])
 export class DefaultDtoMapper extends AutoMapper {}
