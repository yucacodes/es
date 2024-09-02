import { Time } from '../domain'
import type { implementationConfig } from '../implementation'
import { container, DependencyContainer } from '../injection'
import { Logger } from '../logger'
import {
  HttpAuthProvider,
  HttpControllerWrapper,
  HttpRouter,
  isHttpControllerConfig,
} from '../presentation'
import { ServerConfig } from './server-config'
import { ServerTimeProvider } from './server-time-provider'

export interface ServerRunConfig {
  port: number
}

export class Server {
  private logger = new Logger('EasyServer')
  private httpControllers: HttpControllerWrapper[]
  private httpAuthProviders: HttpAuthProvider[] = []
  private container: DependencyContainer

  constructor(config: ServerConfig, router: HttpRouter) {
    this.container = container.createChildContainer()
    this.registerInjections(config)
    // this.resolveAuthProviders()
    this.httpControllers = this.resolveHTTPControllers(config, router)
  }

  private registerInjections(config: ServerConfig) {
    this.container.register(Time as any, ServerTimeProvider)
    const { injections } = config
    injections?.forEach((x) => {
      if (x === false) return
      ;[x].flat().forEach((x) => {
        const config = x.prototype.__config__() as implementationConfig<any>
        if (config.base) this.container.register(config.base as any, x)
      })
    })
  }

  // private resolveAuthProviders() {
  //   const { authProviders } = this.__config__()
  //   authProviders?.forEach((x) => {
  //     if ((x as any)[socketAuthProviderDecoratorToken]) {
  //       this.socketAuthProvider = container.resolve(x as any)
  //     } else {
  //       throw new Error(`Not supported auth provider`)
  //     }
  //   })
  // }

  // private addEventsListeners() {
  //   this.socketsServer.listen(this.httpServer)
  //   this.socketsServer.use((socket, next) => {
  //     this.logger.info(`Socket connection: ${socket.conn.remoteAddress}`)
  //     socket.onAny((event) => {
  //       this.logger.info(`Socket ${socket.conn.remoteAddress}: ${event}`)
  //     })
  //     next()
  //   })
  //   this.socketsServer.on('connection', (socket) => {
  //     this.eventsControllers.forEach((x) => socket.on(...x.listenFor(socket)))
  //   })
  // }

  // private resolveEventsEmitters(): Map<Function, SocketEventEmitter> {
  //   const { emitters } = this.__config__()
  //   return new Map(
  //     emitters?.map((x) => {
  //       return [
  //         x.model,
  //         { event: x.event, mapper: container.resolve(x.mapper) },
  //       ]
  //     }),
  //   )
  // }

  private resolveHTTPControllers(
    config: ServerConfig,
    router: HttpRouter,
  ): HttpControllerWrapper[] {
    const { controllers } = config
    return (
      controllers
        ?.filter((x) => isHttpControllerConfig(x))
        .map(
          (x) =>
            new HttpControllerWrapper(
              this.container,
              x as any,
              router,
              this.httpAuthProviders,
              [],
            ),
        ) ?? []
    )
  }

  // private resolveEventsControllers(): SocketEventController[] {
  //   const { controllers } = this.__config__()
  //   return (
  //     controllers?.map((x) => {
  //       const inlineConfig = this.inlineEventControllerConfig(x)
  //       if (inlineConfig) {
  //         return new SocketEventControllerForUseCase(
  //           inlineConfig,
  //           this.socketsServer,
  //           this.socketAuthProvider,
  //           this.eventsEmiters
  //         )
  //       }
  //       throw new Error(`Controller configuration not supported`)
  //     }) ?? []
  //   )
  // }

  // private inlineEventControllerConfig(
  //   controllerConfig: ControllerConfig
  // ): InlineEventControllerConfig | undefined {
  //   if (typeof controllerConfig !== 'object') return undefined
  //   if (!(controllerConfig as InlineEventControllerConfig).event)
  //     return undefined
  //   return controllerConfig as InlineEventControllerConfig
  // }

  // private classEventControllerConfig(
  //   controllerConfig: ControllerConfig
  // ): Constructor<EventController<unknown, unknown>> | undefined {
  //   if (typeof controllerConfig !== 'function') return undefined
  // }
}
