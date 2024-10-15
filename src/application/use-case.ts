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

export type useCaseConfigValidation<Req> = {
  requestValidation?: Constructor<Req>
}

export type useCaseConfigAuthorization<Req> = {
  authorizationScope?: (req: Req) => string
  authorizedRoles?: string[]
}

export type useCaseConfig<Req = any> = useCaseConfigAuthorization<Req> &
  useCaseConfigValidation<Req> & { responseMapper?: Mapper<any, any> }

export function useCase<Req>(config?: useCaseConfig<Req>) {
  config = config ?? {}
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
  config: useCaseConfig,
  logger: Logger,
) {
  if (!config.requestValidation) {
    return req
  }

  req = plainToInstance(config.requestValidation, req)
  const requestErrors = await validate(req as any)
  if (requestErrors.length > 0) {
    logger.error(`Bad Request`, requestErrors)
    throw new BadRequest('Bad Request', requestErrors)
  }
  return req
}

async function performAuthValidation(
  req: any,
  config: useCaseConfig,
  logger: Logger,
  auth: Auth | undefined,
  container: DependencyContainer,
) {
  if (!config.authorizationScope) {
    return
  }

  const resolvedScope = config.authorizationScope(req)

  const authorization =
    auth && auth instanceof Auth
      ? auth
      : (container.resolve(Auth as any) as Auth)

  const userRoles = authorization.roles()

  for (const allowedRole of config.authorizedRoles ?? []) {
    if (
      userRoles
        .filter((x) => x.scope === resolvedScope)
        .map((x) => x.role)
        .includes(allowedRole)
    ) {
      return
    }
  }

  throw new Unauthorized(
    `Not allow action for provided authorization roles`,
    authorization.get(),
    resolvedScope,
    config.authorizedRoles ?? [],
  )
}
