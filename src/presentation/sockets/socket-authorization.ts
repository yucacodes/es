import { Authorization } from '../../application'
import { Logger } from '../../logger'
import type { Socket } from 'socket.io'
import type { SocketAuthProvider } from './socket-auth-provider'

export class SocketAuthorization<Auth> extends Authorization<Auth> {
  private auth: Auth | null = null
  private logger: Logger

  constructor(
    private authProvider: SocketAuthProvider<Auth> | null,
    private socket: Socket,
    private controlledEvent: string,
    private eventCount: number
  ) {
    super()
    this.logger = new Logger(`${controlledEvent}:Authorization`)
  }

  get() {
    const auth = this._get_()
    if (!auth) {
      throw new Error('Request has no authorization')
    }
    this.logger.info(`(${this.eventCount}) get  \n${JSON.stringify(auth, null, 2)}`)
    return auth
  }

  set(auth: Auth): void {
    this.provider().setAuth(this.socket, auth)
    this.logger.info(`(${this.eventCount}) set \n${JSON.stringify(auth, null, 2)}`)
  }

  roles(): string[] {
    const auth = this._get_()
    if (!auth) return []
    return this.provider().roles(auth)
  }

  private _get_() {
    if (!this.auth) {
      this.auth = this.provider().getAuth(this.socket)
    }
    return this.auth
  }

  private provider(): SocketAuthProvider<Auth> {
    if (!this.authProvider) throw new Error(`Not found AuthProvider`)
    return this.authProvider
  }
}
