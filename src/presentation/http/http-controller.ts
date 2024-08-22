import { IncomingMessage, ServerResponse } from 'http'
import { type Constructor } from '../../generics'

export const httpControllerType = 'HTTPController'

export type HttpController = {
  all?(req: IncomingMessage, res: ServerResponse): Promise<void>
  get?(req: IncomingMessage, res: ServerResponse): Promise<void>
  post?(req: IncomingMessage, res: ServerResponse): Promise<void>
  put?(req: IncomingMessage, res: ServerResponse): Promise<void>
  delete?(req: IncomingMessage, res: ServerResponse): Promise<void>
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
