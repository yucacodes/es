import type { Socket } from 'socket.io'
import { Auth, EventsBus } from '../../application'

import type { Server as SocketsServer } from 'socket.io'
import { container, type DependencyContainer } from '../../injection'
import { Logger } from '../../logger'
import type { InlineEventControllerConfig } from '../controller'
import type { SocketAuthProvider } from './socket-auth-provider'
import { SocketAuth } from './socket-authorization'
import type { SocketEventEmitter } from './socket-events-bus'
import { SocketEventsBus } from './socket-events-bus'
import { type SocketCallback } from './sockets-types'

export abstract class SocketEventController {
  eventsCount = 0
  logger: Logger

  constructor(
    private controledEvent: string,
    private socketsServer: SocketsServer,
    private authProvider: SocketAuthProvider | null,
    private eventsEmiters: Map<Function, SocketEventEmitter>
  ) {
    this.logger = new Logger(`${controledEvent}:Controller`)
  }

  public listenFor(socket: Socket) {
    const listener = async (
      input: any,
      callback: SocketCallback<any> | undefined
    ) => {
      this.eventsCount++
      const eventId = this.eventsCount
      try {
        this.logger.info(`(${eventId}) received`)
        const requestContainer = container.createChildContainer()
        requestContainer.register(Auth as any, {
          useValue: new SocketAuth(
            this.authProvider,
            socket,
            this.controledEvent,
            eventId
          ),
        })
        requestContainer.register(EventsBus as any, {
          useValue: new SocketEventsBus(
            this.eventsEmiters,
            this.socketsServer,
            socket,
            this.controledEvent,
            eventId
          ),
        })
        const data = await this.handleRequest(requestContainer, input)
        this.logger.info(`(${eventId}) success`)
        return callback && callback({ success: true, data })
      } catch (error) {
        this.logger.error(`(${eventId}) error`, error as Error)
        return callback && callback({ success: false })
      }
    }
    return [this.controledEvent as any, listener] as const
  }

  protected abstract handleRequest(
    container: DependencyContainer,
    request: any
  ): Promise<any>
}

export class SocketEventControllerForUseCase extends SocketEventController {
  constructor(
    private inlineConfig: InlineEventControllerConfig,
    socketsServer: SocketsServer,
    authProvider: SocketAuthProvider | null,
    eventsEmiters: Map<Function, SocketEventEmitter>
  ) {
    super(inlineConfig.event, socketsServer, authProvider, eventsEmiters)
  }

  protected async handleRequest(
    container: DependencyContainer,
    input: any
  ): Promise<any> {
    container.afterResolution(this.inlineConfig.useCase, (_, uc) => {
      // eslint-disable-next-line no-extra-semi
      ;([uc].flat()[0] as any).__container__ = container
    })
    const useCase = container.resolve(this.inlineConfig.useCase)
    return await useCase.perform(input)
  }
}
