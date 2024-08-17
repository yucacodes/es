import { type Socket } from 'socket.io'
import { AuthInfo } from '../../application'
import type { Constructor } from '../../generics'
import { singleton } from '../../injection'

export type SocketAuthProvider = {
  getAuth(socket: Socket): AuthInfo | null
  setAuth(socket: Socket, auth: AuthInfo): void
}

export const socketAuthProviderDecoratorToken = '__socketAuthProvider__'
export function socketAuthProvider() {
  return function (constructor: Constructor<SocketAuthProvider>) {
    // eslint-disable-next-line no-extra-semi
    ;(constructor as any)[socketAuthProviderDecoratorToken] = true
    singleton()(constructor)
  }
}
