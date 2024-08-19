import { dtoMapper } from "../dto-mapper";


@dtoMapper({ model: Date })
export class DateToMillisTimestampMapper {
  map(date: Date): number {
    return date.getTime()
  }
}
