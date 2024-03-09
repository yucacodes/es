import crypto from 'crypto'

export function generateSecureRandomSecretString(nBytes: number = 20): string {
  return crypto.randomBytes(nBytes).toString('hex')
}
