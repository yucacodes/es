import crypto from 'crypto'

export function secureSecret(nBytes: number = 20): string {
  return crypto.randomBytes(nBytes).toString('hex')
}
