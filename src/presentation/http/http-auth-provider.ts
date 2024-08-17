import type { Request } from 'express'
import { AuthInfo } from '../../application'

export type HttpAuthProvider = {
  getAuth(req: Request): AuthInfo | null
  setAuth(res: Response, auth: AuthInfo): void
}
