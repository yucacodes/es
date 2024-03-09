import { type Constructor } from '../generics'

export const eventControllerType = 'EventController'

export type EventController<Req, Res> = {
  handle(request: Req): Promise<Res>
}

export interface eventControllerConfig {
  event: string
}

export function eventController(config: eventControllerConfig) {
  return <Req, Res>(constructor: Constructor<EventController<Req, Res>>) => {
    constructor.prototype.__config__ = function __config__() {
      return {
        type: eventControllerType,
        event: config.event,
      }
    }
  }
}
