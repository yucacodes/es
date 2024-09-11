import { IncomingMessage } from 'http'

export class HttpRequest extends IncomingMessage {
  declare query: { [key: string]: string }

  constructor(req: IncomingMessage) {
    super(req.socket)
    Object.assign(this, req)
  }

  allData(): object {
    return Object.assign({}, this.body, this.query, this.params)
  }
}
