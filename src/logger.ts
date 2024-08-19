import inspector from 'inspector'
import pino, { type Logger as PinoLogger } from 'pino'

const LogLevelMappping = {
  trace: 1000,
  debug: 2000,
  info: 3000,
  warn: 4000,
  error: 5000,
  fatal: 6000,
  silent: 7000,
}

export class Logger {
  private logger: PinoLogger

  constructor(baseName: string | Function) {
    baseName = typeof baseName === 'string' ? baseName : baseName.name
    const logLevelName = (process.env.LOG_LEVEL ?? 'silent').toLowerCase()
    const logLevel =
      (LogLevelMappping as any)[logLevelName] ?? 'silent'
    if (inspector.url() !== undefined) {
      this.logger = {
        trace: (...args: any) =>
          logLevel <= LogLevelMappping.trace &&
          console.trace(`${baseName}: `, ...args),
        debug: (...args: any) =>
          logLevel <= LogLevelMappping.debug &&
          console.debug(`${baseName}: `, ...args),
        info: (...args: any) =>
          logLevel <= LogLevelMappping.info &&
          console.info(`${baseName}: `, ...args),
        warn: (...args: any) =>
          logLevel <= LogLevelMappping.warn &&
          console.warn(`${baseName}: `, ...args),
        error: (...args: any) =>
          logLevel <= LogLevelMappping.error &&
          console.error(`${baseName}: `, ...args),
        fatal: (...args: any) =>
          logLevel <= LogLevelMappping.fatal &&
          console.error(`${baseName}: `, ...args),
      } as any
    } else {
      this.logger = pino({
        timestamp: false,
        formatters: {
          bindings: (x) => ({ ...x, pid: baseName }),
        },
        level: logLevelName,
      })
    }
  }

  trace(message: string): void {
    this.logger.trace(message)
  }

  debug(message: string): void {
    this.logger.debug(message)
  }

  info(message: string): void {
    this.logger.info(message)
  }

  warn(message: string): void {
    this.logger.warn(message)
  }

  error(message: string, error?: any): void {
    this.logger.error(error, message)
  }
}
