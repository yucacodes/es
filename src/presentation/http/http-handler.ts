import { HttpEnd } from './http-end'
import { HttpRequest } from './http-request'
import { HttpResponse } from './http-response'

export type HttpHandler = (
  req: HttpRequest,
  res: HttpResponse,
) => Promise<HttpEnd>
