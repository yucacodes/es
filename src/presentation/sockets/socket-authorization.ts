import type { Socket } from 'socket.io'
import { Auth, AuthInfo } from '../../application'
import { Logger } from '../../logger'
import type { SocketAuthProvider } from './socket-auth-provider'

export class SocketAuth extends Auth {
  private authInfo: AuthInfo | null = null
  private logger: Logger

  constructor(
    private authProvider: SocketAuthProvider | null,
    private socket: Socket,
    private controlledEvent: string,
    private eventCount: number,
  ) {
    super()
    this.logger = new Logger(`${controlledEvent}:Authorization`)
  }

  get() {
    const auth = this._get_()
    if (!auth) {
      throw new Error('Request has no authorization')
    }
    this.logger.info(
      `(${this.eventCount}) get  \n${JSON.stringify(auth, null, 2)}`,
    )
    return auth
  }

  set(auth: AuthInfo): void {
    this.provider().setAuth(this.socket, auth)
    this.logger.info(
      `(${this.eventCount}) set \n${JSON.stringify(auth, null, 2)}`,
    )
  }

  private _get_() {
    if (!this.authInfo) {
      this.authInfo = this.provider().getAuth(this.socket)
    }
    return this.authInfo
  }

  private provider(): SocketAuthProvider {
    if (!this.authProvider) throw new Error(`Not found AuthProvider`)
    return this.authProvider
  }
}
