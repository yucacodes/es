import { TimeProvider } from '../domain'
import type { Application } from 'express'
import { default as express } from 'express'
import { createServer, type Server as HttpServer } from 'http'
import { Server as SocketsServer } from 'socket.io'
import { type Constructor } from '../generics'
import type { implementationConfig } from '../implementation'
import { container } from '../injection'
import { Logger } from '../logger'
import type {
  AuthProviderConfig,
  EventController,
  HttpAuthProvider,
  InlineEventControllerConfig,
  SocketAuthProvider,
  SocketEventController,
  SocketEventEmitter,
} from '../presentation'
import {
  socketAuthProviderDecoratorToken,
  SocketEventControllerForUseCase,
  type ControllerConfig,
  type EmitterConfig,
} from '../presentation'
import { ServerTimeProvider } from './server-time-provider'

export interface ServerRunConfig {
  port: number
}

export abstract class Server {
  private logger = new Logger('Server')
  private expressApp: Application
  private httpServer: HttpServer
  private socketsServer: SocketsServer
  private eventsEmiters: Map<Function, SocketEventEmitter>
  private eventsControllers: SocketEventController[]
  private socketAuthProvider: SocketAuthProvider<any> | null = null
  private httpAuthProvider: HttpAuthProvider<any> | null = null

  constructor() {
    this.expressApp = express()
    this.httpServer = createServer(this.expressApp)
    this.socketsServer = new SocketsServer()
    this.registerImplementations()
    this.resolveAuthProviders()
    this.eventsEmiters = this.resolveEventsEmitters()
    this.eventsControllers = this.resolveEventsControllers()
    this.addEventsListeners()
  }

  run(runConfig: ServerRunConfig) {
    this.httpServer.listen(runConfig.port, () => {
      this.logger.info(`Running on port ${runConfig.port}`)
    })
  }

  private __config__(): serverConfig {
    throw new Error(`Should config the server using @server decorator`)
  }

  private registerImplementations() {
    container.register(TimeProvider as any, ServerTimeProvider)
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

  private addEventsListeners() {
    this.socketsServer.listen(this.httpServer)
    this.socketsServer.use((socket, next) => {
      this.logger.info(`Socket connection: ${socket.conn.remoteAddress}`)
      socket.onAny((event) => {
        this.logger.info(`Socket ${socket.conn.remoteAddress}: ${event}`)
      })
      next()
    })
    this.socketsServer.on('connection', (socket) => {
      this.eventsControllers.forEach((x) => socket.on(...x.listenFor(socket)))
    })
  }

  private resolveEventsEmitters(): Map<Function, SocketEventEmitter> {
    const { emitters } = this.__config__()
    return new Map(
      emitters?.map((x) => {
        return [
          x.model,
          { event: x.event, mapper: container.resolve(x.mapper) },
        ]
      })
    )
  }

  private resolveEventsControllers(): SocketEventController[] {
    const { controllers } = this.__config__()
    return (
      controllers?.map((x) => {
        const inlineConfig = this.inlineEventControllerConfig(x)
        if (inlineConfig) {
          return new SocketEventControllerForUseCase(
            inlineConfig,
            this.socketsServer,
            this.socketAuthProvider,
            this.eventsEmiters
          )
        }
        throw new Error(`Controller configuration not supported`)
      }) ?? []
    )
  }

  private inlineEventControllerConfig(
    controllerConfig: ControllerConfig
  ): InlineEventControllerConfig | undefined {
    if (typeof controllerConfig !== 'object') return undefined
    if (!(controllerConfig as InlineEventControllerConfig).event)
      return undefined
    return controllerConfig as InlineEventControllerConfig
  }

  private classEventControllerConfig(
    controllerConfig: ControllerConfig
  ): Constructor<EventController<unknown, unknown>> | undefined {
    if (typeof controllerConfig !== 'function') return undefined
  }
}

export type ImplementationConfig =
  | Constructor<Object>
  | false
  | Constructor<Object>[]

export interface serverConfig {
  controllers?: ControllerConfig[]
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
