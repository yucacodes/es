import { Router } from 'express'
import { IncomingMessage, ServerResponse } from 'http'
import { HttpMethod, HttpResponse, HttpRouter } from '../http'

export class ExpressRouter implements HttpRouter {
  constructor(private expressRouter: Router) {}

  on(
    method: HttpMethod,
    path: string,
    listener: (
      req: IncomingMessage,
      res: ServerResponse,
    ) => Promise<HttpResponse>,
  ): void {
    const lcMethod = method.toLowerCase()
    const fnMethod = (this.expressRouter as any)[lcMethod]

    fnMethod.apply(this.expressRouter, [
      path,
      async (_req: any, _res: any, _next: any) => {
        const rres = await listener(_req, _res)
        _next()
      },
    ])
  }

  async dispatch(req: IncomingMessage, res: ServerResponse): Promise<void> {
    return new Promise((resolve) => {
      ;(this.expressRouter as any)(req, res, () => {
        resolve()
      })
    })
  }
}
