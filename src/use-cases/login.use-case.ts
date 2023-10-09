import { compareHashedPassword } from '../lib/password'
import UserRepository from '../repositories/user.repository'
import createUserStatefulTokenUseCase from './create-user-stateful-token.use-case'

export class InvalidPasswordError extends Error {
  constructor() {
    super('Invalid password provided.')
  }
}

export default async function loginUseCase(
  credentials: { email: string; password: string },
  userRepository: UserRepository
) {
  const user = await userRepository.findByEmail(credentials.email)
  const isValidPassword = await compareHashedPassword(credentials.password, user.password)

  if (!isValidPassword) {
    throw new InvalidPasswordError()
  }

  return await createUserStatefulTokenUseCase(user)
}
