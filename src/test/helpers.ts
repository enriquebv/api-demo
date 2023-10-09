import { type Server } from 'http'
import { Application } from 'express'
import { UserEntity, UserRole } from '../entities/user.entity'
import { hashPassword } from '../lib/password'
import { userRepository } from '../repositories'
import { createServer } from '../server'
import createUserStatefulTokenUseCase from '../use-cases/create-user-stateful-token.use-case'

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

export async function addUser(options: {
  name: string
  email: string
  password: string
  admin?: boolean
}): Promise<number> {
  const { id } = await userRepository.create({
    name: options.name,
    email: options.email,
    password: await hashPassword(options.password),
  })

  if (options.admin === true) {
    await userRepository.setRole(id, UserRole.ADMIN)
  }

  return id
}

export async function getAdminToken(adminId: UserEntity['id']): Promise<string> {
  return (await createUserStatefulTokenUseCase(adminId)).token
}
