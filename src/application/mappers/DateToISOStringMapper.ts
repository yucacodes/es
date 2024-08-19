import { dtoMapper } from "../dto-mapper";


@dtoMapper({ model: Date })
export class DateToISOStringMapper {
  map(date: Date): string {
    return date.toISOString()
  }
}
