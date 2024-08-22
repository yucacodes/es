import { Time } from '../domain'
import { type Constructor } from '../generics'
import type { implementationConfig } from '../implementation'
import { container } from '../injection'
import { Logger } from '../logger'
import {
  AuthProviderConfig,
  HttpAuthProvider,
  HttpControllerConfig,
  HttpControllerWrapper,
  HttpRouter,
  isHttpControllerConfig,
  SocketAuthProvider,
  socketAuthProviderDecoratorToken,
  SocketEventEmitter,
  type EmitterConfig
} from '../presentation'
import { ServerTimeProvider } from './server-time-provider'

export interface ServerRunConfig {
  port: number
}

export abstract class Server {
  private logger = new Logger('Server')
  private eventsEmiters: Map<Function, SocketEventEmitter>
  private httpControllers: HttpControllerWrapper[]
  //private eventsControllers: EventController[]
  private socketAuthProvider: SocketAuthProvider | null = null
  private httpAuthProviders: HttpAuthProvider[] = []
  private httpAuthProvider: HttpAuthProvider | null = null
  private httpRouter: HttpRouter = '' as any

  constructor() {
    this.registerImplementations()
    this.resolveAuthProviders()
    this.eventsEmiters = this.resolveEventsEmitters()
    // this.eventsControllers = this.resolveEventsControllers()
    this.httpControllers = this.resolveHTTPControllers()
    // this.addEventsListeners()
  }

  // run(runConfig: ServerRunConfig) {
  //   this.httpServer.listen(runConfig.port, () => {
  //     this.logger.info(`Running on port ${runConfig.port}`)
  //   })
  // }

  private __config__(): serverConfig {
    throw new Error(`Should config the server using @server decorator`)
  }

  private registerImplementations() {
    container.register(Time as any, ServerTimeProvider)
    const { implementations } = this.__config__()
    implementations?.forEach((x) => {
      if (x === false) return
      ;[x].flat().forEach((x) => {
        const config = x.prototype.__config__() as implementationConfig<any>
        if (config.base) container.register(config.base as any, x)
      })
    })
  }

  private resolveAuthProviders() {
    const { authProviders } = this.__config__()
    authProviders?.forEach((x) => {
      if ((x as any)[socketAuthProviderDecoratorToken]) {
        this.socketAuthProvider = container.resolve(x as any)
      } else {
        throw new Error(`Not supported auth provider`)
      }
    })
  }

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

  private resolveEventsEmitters(): Map<Function, SocketEventEmitter> {
    const { emitters } = this.__config__()
    return new Map(
      emitters?.map((x) => {
        return [
          x.model,
          { event: x.event, mapper: container.resolve(x.mapper) },
        ]
      }),
    )
  }

  private resolveHTTPControllers(): HttpControllerWrapper[] {
    const { controllers } = this.__config__()
    return (
      controllers
        ?.filter((x) => isHttpControllerConfig(x))
        .map(
          (x) =>
            new HttpControllerWrapper(
              container,
              x as any,
              this.httpRouter,
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

export type ImplementationConfig =
  | Constructor<Object>
  | false
  | Constructor<Object>[]

export interface serverConfig {
  controllers?: HttpControllerConfig[]
  emitters?: EmitterConfig[]
  authProviders?: AuthProviderConfig[]
  implementations?: ImplementationConfig[]
}

export function server(config: serverConfig) {
  return (constructor: Constructor<Server>) => {
    constructor.prototype.__config__ = function __config__() {
      return config
    }
  }
}
