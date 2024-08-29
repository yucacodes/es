import { HttpMiddleware } from './http-middleware'
// export type HttpRouter = fmw.Instance<fmw.HTTPVersion.V1>
export type HttpRouter = {
  [method: string]:
    | undefined
    | ((path: string, handler: HttpMiddleware) => void)
}
