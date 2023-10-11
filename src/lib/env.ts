import dotenv from 'dotenv'

dotenv.config()

export default function getEnvVariable(variable: 'PORT' | 'JWT_SECRET' | 'ALLOWED_ORIGINS' | 'NODE_ENV'): string {
  const value = process.env[variable]

  if (value === undefined) {
    throw new Error(`Missing "${variable}" env variable.`)
  }

  return value
}
