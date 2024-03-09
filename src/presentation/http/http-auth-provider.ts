import type { Request } from 'express'

export type HttpAuthProvider<Auth> = {
  getAuth(req: Request): Auth | null
  setAuth(res: Response, auth: Auth): void
  roles(auth: Auth): string[]
}
`   `