import fmw from 'find-my-way'
import { IncomingMessage, ServerResponse } from 'http'
import { allHttpMethods, HttpMethod, HttpResponse, HttpRouter } from '../http'

export class FindMyWayRouter implements HttpRouter {
  constructor(private fmwRouter: fmw.Instance<fmw.HTTPVersion.V1>) {}

  on(
    method: HttpMethod | 'ALL',
    path: string,
    listener: (
      req: IncomingMessage,
      res: ServerResponse,
    ) => Promise<HttpResponse>,
  ): void {
    this.fmwRouter.on(
      method === 'ALL' ? (allHttpMethods as any) : method,
      path,
      listener,
    )
  }

  async dispatch(req: IncomingMessage, res: ServerResponse): Promise<void> {
    return new Promise((resolve) => {
      this.fmwRouter.lookup(req, res, resolve)
    })
  }
}
