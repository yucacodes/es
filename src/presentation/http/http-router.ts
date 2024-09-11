import { IncomingMessage, ServerResponse } from 'node:http'
import { HttpMethod } from './http-method'
import { HttpResponse } from './http-response'

export interface HttpRouter {
  on(
    method: HttpMethod | 'ALL',
    path: string,
    listener: (
      req: IncomingMessage,
      res: ServerResponse,
    ) => Promise<HttpResponse>,
  ): void
  dispatch(req: IncomingMessage, res: ServerResponse): Promise<void>
}
