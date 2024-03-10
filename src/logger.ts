import inspector from 'inspector'
import pino, { type Logger as PinoLogger } from 'pino'

export class Logger {
  private logger: PinoLogger

  constructor(baseName: string | Function) {
    baseName = typeof baseName === 'string' ? baseName : baseName.name

    if (inspector.url() !== undefined) {
      this.logger = {
        trace: (...args: any) => console.trace(`${baseName}: `, ...args),
        debug: (...args: any) => console.debug(`${baseName}: `, ...args),
        info: (...args: any) => console.info(`${baseName}: `, ...args),
        warn: (...args: any) => console.warn(`${baseName}: `, ...args),
        error: (...args: any) => console.error(`${baseName}: `, ...args),
      } as any
    } else {
      this.logger = pino({
        timestamp: false,
        formatters: {
          bindings: (x) => ({ ...x, pid: baseName }),
        },
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
