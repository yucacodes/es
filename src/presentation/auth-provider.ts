import type { Constructor } from '../generics'
import type { HttpAuthProvider } from './http'
import type { SocketAuthProvider } from './sockets'

export type AuthProviderConfig =
  | Constructor<SocketAuthProvider<unknown>>
  | Constructor<HttpAuthProvider<unknown>>
