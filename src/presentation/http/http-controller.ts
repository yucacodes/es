import { type Constructor } from '../../generics'
import { HttpEnd } from './http-end'
import { HttpRequest } from './http-request'
import { HttpResponse } from './http-response'

export const httpControllerType = 'HTTPController'

export type HttpController = {
  GET?(req: HttpRequest, res: HttpResponse): Promise<HttpEnd>
  POST?(req: HttpRequest, res: HttpResponse): Promise<HttpEnd>
  PUT?(req: HttpRequest, res: HttpResponse): Promise<HttpEnd>
  DELETE?(req: HttpRequest, res: HttpResponse): Promise<HttpEnd>
  ALL?(req: HttpRequest, res: HttpResponse): Promise<HttpEnd>
}

export interface httpControllerConfig {
  path: string
}

export function httpController(config: httpControllerConfig) {
  return (constructor: Constructor<HttpController>) => {
    ;(constructor as any).__type__ = httpControllerType
    ;(constructor as any).__config__ = config
  }
}

export function extractHttpControllerClassConfig(
  controller: Constructor<HttpController>,
): httpControllerConfig {
  return (controller as any).__config__
}
