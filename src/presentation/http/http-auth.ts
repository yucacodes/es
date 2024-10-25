import { IncomingMessage } from 'http'
import { Auth, AuthInfo } from '../../application'
import { injectable } from '../../injection'
import { HttpResponse } from './http-response'

export type HttpAuthProvider = {
  getAuth(req: IncomingMessage): AuthInfo | null
  setAuth(res: HttpResponse, auth: AuthInfo): void
}

@injectable()
export class HttpAuth extends Auth {
  private authInfo: AuthInfo | null = null

  constructor(
    private authProviders: HttpAuthProvider[],
    private req: IncomingMessage,
    private res: HttpResponse,
  ) {
    super()
    for (let provider of this.authProviders) {
      this.authInfo = provider.getAuth(this.req)
      if (this.authInfo) break
    }
  }

  set(authInfo: AuthInfo): void {
    for (let provider of this.authProviders) {
      provider.setAuth(this.res, authInfo)
    }
  }

  get(): AuthInfo {
    if (!this.authInfo) throw new Error()
    return this.authInfo
  }
}
