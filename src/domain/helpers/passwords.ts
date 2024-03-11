import { randomBytes, scrypt, timingSafeEqual } from 'crypto'

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  return new Promise<string>((resolve, reject) => {
    scrypt(password, salt, 64, (err, buf) => {
      if (err) return reject(err)
      resolve(`${buf.toString('hex')}.${salt}`)
    })
  })
}

export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  const [hashedPassword, salt] = hash.split('.')
  const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex')
  return new Promise<boolean>((resolve, reject) => {
    scrypt(password, salt, 64, (err, suppliedPasswordBuf) => {
      if (err) return reject(err)
      resolve(timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf))
    })
  })
}
