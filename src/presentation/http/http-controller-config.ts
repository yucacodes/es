import { UseCase } from '../../application'
import { Constructor } from '../../generics'
import { HttpController } from './http-controller'
import { allHttpMethods, HttpMethod } from './http-method'


export type HttpControllerConfigForUseCase = {
  method: HttpMethod
  path: string
  useCase: Constructor<UseCase<any, any>>
}

export type HttpControllerConfig =
  | HttpControllerConfigForUseCase
  | Constructor<HttpController>

  
export function listHttpMethodsForControllerClass(
  config: Constructor<HttpController>,
): HttpMethod[] {
  const classMethods = new Set(Object.getOwnPropertyNames(config.prototype))
  return allHttpMethods.filter((x) => classMethods.has(x))
}

export function isHttpControllerClassConfig(config: any): boolean {
  if (typeof config !== 'function' || !config.prototype) return false
  const classHttpMethods = listHttpMethodsForControllerClass(config)
  if (classHttpMethods.length == 0) return false
  return true
}

export function isHttpControllerForUseCaseConfig(config: any): boolean {
  if (typeof config !== 'object' || !config) return false

  if (!config.method) return false
  if (!config.path) return false
  if (!config.useCase) return false

  return true
}

export function isHttpControllerConfig(config: any): boolean {
  if (isHttpControllerClassConfig(config)) return true
  else if (isHttpControllerForUseCaseConfig(config)) return true
  return false
}
