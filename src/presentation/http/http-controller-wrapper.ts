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
import { HttpHandler } from './http-handler'
import { HttpMethod } from './http-method'
import { HttpMiddleware } from './http-middleware'
import { HttpRequest } from './http-request'
import { HttpResponse } from './http-response'
import { HttpRouter } from './http-router'

export class HttpControllerWrapper {
  constructor(
    private container: DependencyContainer,
    config: HttpControllerConfig,
    public router: HttpRouter,
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
      this.configForHandler(method, config.path, async (req, res) => {
        const requestContainer = this.pupulateRequestContainer(req, res)
        const controller = requestContainer.resolve(ctor)
        const fnMethod = controller[method]
        if (!fnMethod) return res.send(404)
        return await fnMethod.apply(controller, [req, res])
      })
    }
  }

  private configForUseCase(config: HttpControllerConfigForUseCase) {
    this.configForHandler(config.method, config.path, async (req, res) => {
      const requestContainer = this.pupulateRequestContainer(req, res)
      const useCase = requestContainer.resolve(config.useCase)
      const result = await useCase.perform(req.allData())
      return res.send(200, config.responseFormat, result)
    })
  }

  private configForHandler(
    method: HttpMethod,
    path: string,
    handler: HttpHandler,
  ) {
    this.router.on(method, path, async (_req, _res) => {
      const req = new HttpRequest(_req.socket)
      const res = new HttpResponse(req)
      await this.runMiddlewares(req, res)
      await handler(req, res)
      return res
    })
  }

  private pupulateRequestContainer(
    req: HttpRequest,
    res: HttpResponse,
  ): DependencyContainer {
    const auth = new HttpAuth(this.authProviders, req, res)
    const requestContainer = this.container.createChildContainer()
    requestContainer.register(Auth as any, {
      useValue: auth,
    })
    return requestContainer
  }

  private runMiddlewares(req: HttpRequest, res: HttpResponse): Promise<void> {
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
