import { IncomingMessage, ServerResponse } from 'http'

export type HttpMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next?: () => void,
) => void
