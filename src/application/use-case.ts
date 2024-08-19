import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { type Constructor } from '../generics'
import { injectable, type DependencyContainer } from '../injection'
import { Logger } from '../logger'
import { Mapper } from '../mapper'
import { Auth } from './authorization'
import { AutoMapper } from './auto-mapper'
import { BadRequest, Unauthorized } from './errors'

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

export type useCaseConfigForSingleRole<Req> = {
  scope: string | ((req: Req) => string)
  allowRole: string
}

export type useCaseConfigForMultipleRoles<Req> = {
  scope: string | ((req: Req) => string)
  allowRoles: string[]
}

export type useCaseConfigForNoAuthorization = {
  disableAuthValidation: true
}

export type useCaseConfigAuthorization<Req> =
  | useCaseConfigForSingleRole<Req>
  | useCaseConfigForMultipleRoles<Req>
  | useCaseConfigForNoAuthorization

export type useCaseConfig<Req> = useCaseConfigAuthorization<Req> &
  useCaseConfigValidation<Req> & { responseMapper?: Mapper<any, any> }

export function useCase<Req>(config: useCaseConfig<Req>) {
  return <Res>(constructor: Constructor<UseCase<Req, Res>>) => {
    const logger = new Logger(`${constructor.name}:UseCase`)
    const __perform__ = constructor.prototype.perform as Function

    constructor.prototype.perform = async function perform(
      req: Req,
    ): Promise<Res> {
      const __request__ = await performRequestValidation(req, config, logger)

      await performAuthValidation(
        __request__,
        config,
        logger,
        this.auth,
        this.__container__,
      )
      const response = await __perform__.apply(this, [__request__])
      return config.responseMapper
        ? config.responseMapper.map(response)
        : new AutoMapper().map(response)
    }

    injectable()(constructor)
  }
}

async function performRequestValidation(
  req: any,
  config: useCaseConfigValidation<any>,
  logger: Logger,
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
      throw new BadRequest('Bad Request', requestErrors)
    }
  }
  return __request__
}

async function performAuthValidation(
  req: any,
  config: useCaseConfigAuthorization<any>,
  logger: Logger,
  auth: Auth | undefined,
  container: DependencyContainer,
) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if ((config as useCaseConfigForNoAuthorization).disableAuthValidation) {
    return
  }
  const { allowRole, allowRoles, scope } = config as Partial<
    useCaseConfigForSingleRole<any> & useCaseConfigForMultipleRoles<any>
  >

  let __scope__: string = ''

  if (typeof scope == 'function') {
    __scope__ = scope(req)
  } else if (typeof scope == 'string') {
    __scope__ = scope
  } else if (!scope) {
    throw new Error(
      `Invalid UseCase config, s required define a scope for auth validation`,
    )
  }

  let __allowRoles__: string[] = []

  if (typeof allowRole == 'string') {
    __allowRoles__ = [allowRole]
  } else if (Array.isArray(allowRoles)) {
    __allowRoles__ = allowRoles
  } else {
    throw new Error(
      `Invalid UseCase config, is required indicate allowed roles`,
    )
  }

  const authorization =
    auth && auth instanceof Auth
      ? auth
      : (container.resolve(Auth as any) as Auth)
  const roles = authorization.roles()

  for (const allowedRole of __allowRoles__) {
    if (
      roles
        .filter((x) => x.scope === __scope__)
        .map((x) => x.role)
        .includes(allowedRole)
    ) {
      return true
    }
  }

  throw new Unauthorized(
    `Not allow action for provided authorization roles`,
    authorization.get(),
    __scope__,
    __allowRoles__,
  )
}
