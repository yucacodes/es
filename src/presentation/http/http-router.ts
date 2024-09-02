import { HttpMiddleware } from './http-middleware'
// export type HttpRouter = fmw.Instance<fmw.HTTPVersion.V1>

export type HttpRouter = {
  get: undefined | ((path: string, handler: HttpMiddleware) => void)
  post: undefined | ((path: string, handler: HttpMiddleware) => void)
  put: undefined | ((path: string, handler: HttpMiddleware) => void)
  delete: undefined | ((path: string, handler: HttpMiddleware) => void)
}
