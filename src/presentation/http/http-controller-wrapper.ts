import { IncomingMessage, ServerResponse } from 'http'
import { Auth } from '../../application'
import { Constructor } from '../../generics'
import { DependencyContainer } from '../../injection'
import { HttpAuth, HttpAuthProvider } from './http-auth'
import {
  extractHttpControllerClassConfig,
  HttpController,
} from './http-controller'
import {
  HttpControllerConfig,
  HttpControllerConfigForUseCase,
  isHttpControllerClassConfig,
  isHttpControllerForUseCaseConfig,
  listHttpMethodsForControllerClass,
} from './http-controller-config'
import { HttpMiddleware } from './http-middleware'
import { HttpRouter } from './http-router'

export class HttpControllerWrapper {
  constructor(
    private container: DependencyContainer,
    config: HttpControllerConfig,
    private router: HttpRouter,
    private authProviders: HttpAuthProvider[],
    private middlewares: HttpMiddleware[],
  ) {
    if (isHttpControllerClassConfig(config)) {
      this.configForControllerClass(config as any)
    } else if (isHttpControllerForUseCaseConfig(config)) {
      this.configForUseCase(config as any)
    }
  }

  private configForControllerClass(ctor: Constructor<HttpController>) {
    const config = extractHttpControllerClassConfig(ctor)
    const methods = listHttpMethodsForControllerClass(ctor)
    for (let method of methods) {
      const lcMethod = method.toLowerCase()
      const methodHandler = this.router[lcMethod]
      if (!methodHandler) throw new Error(`Not supported router`)
      methodHandler.apply(this.router, [
        config.path,
        async (req, res, next) => {
          const requestContainer = this.pupulateRequestContainer(req, res)
          const controller = requestContainer.resolve(ctor)
          const fnMethod = controller[method]
          if (fnMethod) {
            await fnMethod(req, res)
          } else {
            // TODO: Response Not found
          }
          if (typeof next == 'function' && next.name == 'next') {
            next()
          }
        },
      ])
    }
  }

  private configForUseCase(config: HttpControllerConfigForUseCase) {
    const lcMethod = config.method.toLowerCase()
    const methodHandler = this.router[lcMethod]
    if (!methodHandler) throw new Error(`Not supported router`)
    methodHandler.apply(this.router, [
      config.path,
      async (req, res, next) => {
        const requestContainer = this.pupulateRequestContainer(req, res)
        const useCase = requestContainer.resolve(config.useCase)
        const useCaseRequest = Object.assign(
          {},
          (req as any).body,
          (req as any).query,
          (req as any).params,
        )
        const out = await useCase.perform(useCaseRequest)
        res.end(JSON.stringify(out), 'utf-8')
        if (typeof next == 'function' && next.name == 'next') {
          next()
        }
      },
    ])
  }

  private pupulateRequestContainer(
    req: IncomingMessage,
    res: ServerResponse,
  ): DependencyContainer {
    const auth = new HttpAuth(this.authProviders, req, res)
    const requestContainer = this.container.createChildContainer()
    requestContainer.register(Auth as any, {
      useValue: auth,
    })
    return requestContainer
  }

  private runMiddlewares(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let index = 0

      const handleNext = () => {
        const middleware = this.middlewares.at(index)
        if (!middleware) return resolve()
        try {
          index++
          middleware(req, res, handleNext)
        } catch (err) {
          return reject(err)
        }
      }

      handleNext()
    })
  }
}
