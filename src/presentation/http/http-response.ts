import { ServerResponse } from 'http'
import { HttpEnd } from './http-end'
import { HttpFormat } from './http-format'
import { HttpRequest } from './http-request'

export class HttpResponse extends ServerResponse {
  constructor(req: HttpRequest) {
    super(req)
  }

  send(status: number, format?: HttpFormat, data?: any): HttpEnd {
    return new HttpEnd()
  }
}
