import type { Socket, Server as SocketsServer } from 'socket.io'
import type { Notification, Subscription } from '../../application'
import { EventsBus } from '../../application'
import { Logger } from '../../logger'
import type { Mapper } from '../../mapper'

export interface SocketEventEmitter {
  event: string
  mapper: Mapper<any, any>
}

export class SocketEventsBus extends EventsBus {
  private logger: Logger

  constructor(
    private handlers: Map<Function, SocketEventEmitter>,
    private socketsServer: SocketsServer,
    private socket: Socket | null,
    private controlledEvent: string,
    private eventCount: number,
  ) {
    super()
    this.logger = new Logger(`${controlledEvent}:EventsBus`)
  }

  notify<E extends Object>(notification: Notification<E>): void {
    const handler = this.handlers.get(notification.event.constructor)
    if (!handler)
      throw new Error(
        `Not found Emmiter for ${notification.event.constructor.name}`,
      )
    const out = handler.mapper.map(notification.event)
    const origin = notification.includeOrigin
      ? this.socketsServer
      : this.socket ?? this.socketsServer
    origin.in(notification.channel).emit(handler.event, out)
    this.logger.info(
      `(${this.eventCount}) emmited '${handler.event}' to channel '${notification.channel}'`,
    )
  }

  subscribe(subscription: Subscription): void {
    if (!this.socket)
      throw `Not way to subscribe to channel out a socket context`
    this.socket.join(subscription.channel)
    this.logger.info(
      `(${this.eventCount}) subscription to channel '${subscription.channel}'`,
    )
  }

  unsubscribe(subscription: Subscription): void {
    if (!this.socket)
      throw `Not way to unsubscribe from channel out a socket context`
    this.socket.leave(subscription.channel)
    this.logger.info(
      `(${this.eventCount}) cancel subscription to channel '${subscription.channel}'`,
    )
  }
}
