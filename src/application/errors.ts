import { ValidationError } from 'class-validator'
import { AuthInfo } from './authorization'

export class BadRequest extends Error {
  constructor(message: string, public errors: ValidationError[]) {
    super(message)
  }
}

export class Unauthorized extends Error {
  constructor(
    message: string,
    public supliedAuth: AuthInfo | null,
    public scope: string,
    public allowedRoles: string[],
  ) {
    super(message)
  }
}
