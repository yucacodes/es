import bcrypt from 'bcrypt'

export function generatePasswordHash(
  password: string,
  iterations: number = 10
) {
  return bcrypt.hashSync(password, iterations)
}

export function verifyPasswordHash(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}
