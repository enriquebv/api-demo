import jwt, { decode } from 'jsonwebtoken'
import getEnvVariable from './env'

const JWT_SECRET = getEnvVariable('JWT_SECRET')

function getExpirationDateFromToken(token: string): Date | undefined {
  const decoded = jwt.decode(token) as any

  if (decoded && decoded.exp) {
    return new Date(decoded.exp * 1000)
  }
}

export async function buildToken<Content extends object>(
  content?: Content
): Promise<{ token: string; expiresAt: Date }> {
  const payload = content ?? {}
  const secret = JWT_SECRET as string
  const options = {
    expiresIn: '7d',
  }

  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (error, token) => {
      if (error) {
        return reject(error)
      }

      resolve({
        token: token as string,
        expiresAt: getExpirationDateFromToken(token as string) as Date,
      })
    })
  })
}

export function verifyToken(token: string): boolean {
  return false
}
