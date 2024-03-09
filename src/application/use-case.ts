import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { type Constructor } from '../generics'
import { injectable, type DependencyContainer } from '../injection'
import { Logger } from '../logger'
import { Authorization } from './authorization'


export type UseCase<Req, Res> = {
  perform(request: Req): Promise<Res>
}

export type useCaseConfigWithRequestValidator<Req> = {
  requestValidator: Constructor<Req>
}

export type useCaseConfigWithoutRequestValidator = {
  disableRequestValidation: true
}

export type useCaseConfigValidation<Req> =
  | useCaseConfigWithRequestValidator<Req>
  | useCaseConfigWithoutRequestValidator

export type useCaseConfigForAnyRole = {
  allowAnyRole: true
}

export type useCaseConfigForSingleRole<Req> = {
  allowRole: string | ((req: Req) => string)
}

export type useCaseConfigForMultipleRoles<Req> = {
  allowRoles: string[] | ((req: Req) => string[])
}

export type useCaseConfigForNoAuthorization = {
  disableAuthValidation: true
}

export type useCaseConfigAuthorization<Req> =
  | useCaseConfigForAnyRole
  | useCaseConfigForSingleRole<Req>
  | useCaseConfigForMultipleRoles<Req>
  | useCaseConfigForNoAuthorization

export type useCaseConfig<Req> = useCaseConfigAuthorization<Req> &
  useCaseConfigValidation<Req>

export function useCase<Req>(config: useCaseConfig<Req>) {
  return <Res>(constructor: Constructor<UseCase<Req, Res>>) => {
    const logger = new Logger(`${constructor.name}:UseCase`)
    const __perform__ = constructor.prototype.perform as Function

    constructor.prototype.perform = async function perform(
      req: Req
    ): Promise<Res> {
      const __request__ = await performRequestValidation(req, config, logger)
      await performAuthValidation(
        __request__,
        config,
        logger,
        this.__container__
      )
      return __perform__.apply(this, [__request__])
    }

    injectable()(constructor)
  }
}

async function performRequestValidation(
  req: any,
  config: useCaseConfigValidation<any>,
  logger: Logger
) {
  const requestValidator = (config as useCaseConfigWithRequestValidator<any>)
    .requestValidator
  let __request__ = req
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (requestValidator) {
    __request__ = plainToInstance(requestValidator, req)
    const requestErrors = await validate(__request__ as any)
    if (requestErrors.length > 0) {
      logger.error(`Bad Request`, requestErrors)
      throw new Error('Bad Request')
    }
  }
  return __request__
}

async function performAuthValidation(
  req: any,
  config: useCaseConfigAuthorization<any>,
  logger: Logger,
  container: DependencyContainer
) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if ((config as useCaseConfigForNoAuthorization).disableAuthValidation) {
    return
  }
  const { allowRole, allowRoles, allowAnyRole } = config as Partial<
    useCaseConfigForSingleRole<any> &
      useCaseConfigForMultipleRoles<any> &
      useCaseConfigForAnyRole
  >

  let __allowRoles__: string[] = []

  if (typeof allowRole == 'function') {
    __allowRoles__ = [allowRole(req)]
  } else if (typeof allowRole == 'string') {
    __allowRoles__ = [allowRole]
  } else if (typeof allowRoles == 'function') {
    __allowRoles__ = allowRoles(req)
  } else if (Array.isArray(allowRoles)) {
    __allowRoles__ = allowRoles
  } else if (!allowAnyRole) {
    throw new Error(`Invalid UseCase config`)
  }

  const authorization = container.resolve(
    Authorization as any
  ) as Authorization<any>
  const roles = authorization.roles()
  if (allowAnyRole && roles.length > 0) return
  for (const allowedRole of __allowRoles__) {
    if (roles.includes(allowedRole)) {
      return true
    }
  }

  throw new Error(`Not allow action for provided authorization roles`)
}
