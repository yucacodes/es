import { TimeProvider } from '../domain'
import { singleton } from '../injection'

@singleton()
export class ServerTimeProvider extends TimeProvider {
  now(): Date {
    return new Date()
  }
}
