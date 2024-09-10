import { ServerResponse } from 'http'
import { HttpEnd } from './http-end'
import { HttpFormat } from './http-format'

export class HttpResponse extends ServerResponse {
  send(status: number, format?: HttpFormat, data?: any): HttpEnd {
    return new HttpEnd()
  }
}
