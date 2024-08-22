import { HttpMethod } from './http-method'
import { HttpMiddleware } from './http-middleware'
// export type HttpRouter = fmw.Instance<fmw.HTTPVersion.V1>
export type HttpRouter = {
  on: (method: HttpMethod, path: string, handler: HttpMiddleware) => void
}
