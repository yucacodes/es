import { IncomingMessage, ServerResponse } from 'http'
import { HttpEnd } from './http-end'

export class HttpResponse {
  constructor(private req: IncomingMessage, public res: ServerResponse) {}

  status(code: number): HttpResponse {
    this.res.statusCode = code
    return this
  }

  json(data: any): HttpEnd {
    if (data === undefined) {
      return this.empty()
    }
    this.res.setHeader('Content-Type', 'application/json')
    this.res.write(JSON.stringify(data))
    this.res.end()
    return new HttpEnd()
  }

  empty(): HttpEnd {
    this.res.end()
    return new HttpEnd()
  }
}
