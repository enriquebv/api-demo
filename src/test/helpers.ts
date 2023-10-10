import { type Server } from 'http'
import { Application } from 'express'
import { UserEntity, UserRole } from '../entities/user.entity'
import { hashPassword } from '../lib/password'
import { carRepository, userRepository } from '../repositories'
import { createServer } from '../server'
import createUserStatefulTokenUseCase from '../use-cases/create-user-stateful-token.use-case'
import { CarEntity } from '../entities/car.entity'

const BASE_PORT = 3000

/**
 * Creates an instance of existing express app and http server to be used in tests.
 * To allow parallel testing, uses "JEST_WORKER_ID" environment variable to create a new port in each testing process.
 */
export async function createTestServer(): Promise<{ app: Application; server: Server }> {
  const app = createServer()

  if (process.env.JEST_WORKER_ID === undefined) {
    console.warn('Tests needs to be used with jest to work correctly.')
  }

  const workerPort = BASE_PORT + Number(process.env.JEST_WORKER_ID ?? 0)

  return new Promise((resolve) => {
    const server = app.listen(workerPort, () => resolve({ app, server }))
  })
}

export async function addCar(): Promise<CarEntity['id']> {
  const { id } = await carRepository.create({
    name: 'Car Test',
    pricePerMonth: 100,
  })

  return id
}

export async function getUserToken(userId: UserEntity['id']): Promise<string> {
  return (await createUserStatefulTokenUseCase(userId)).token
}

export async function getUserIdByEmail(email: string) {
  return (await userRepository.findByEmail(email)).id
}

export function strictSchema(schema: {
  type: 'object'
  properties: Record<string, unknown>
  required?: string[]
  aditionalProperties?: boolean
}) {
  return {
    required: Object.keys(schema.properties),
    additionalProperties: false,
    ...schema,
  }
}
