import { Time } from '../domain'
import { singleton } from '../injection'

@singleton()
export class ServerTimeProvider extends Time {
  now(): Date {
    return new Date()
  }
}
