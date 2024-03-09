import { type Socket } from 'socket.io'
import type { Constructor } from '../../generics'
import { singleton } from '../../injection'

export type SocketAuthProvider<Auth> = {
  getAuth(socket: Socket): Auth | null
  setAuth(socket: Socket, auth: Auth): void
  roles(auth: Auth): string[]
}

export const socketAuthProviderDecoratorToken = '__socketAuthProvider__'
export function socketAuthProvider() {
  return function <Auth>(constructor: Constructor<SocketAuthProvider<Auth>>) {
    // eslint-disable-next-line no-extra-semi
    ;(constructor as any)[socketAuthProviderDecoratorToken] = true
    singleton()(constructor)
  }
}
