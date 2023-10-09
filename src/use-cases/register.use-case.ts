import { UserToCreateEntity } from '../entities/user.entity'
import { hashPassword } from '../lib/password'
import UserRepository from '../repositories/user.repository'
import createUserStatefulTokenUseCase from './create-user-stateful-token.use-case'

export default async function registerUseCase(userToCreate: UserToCreateEntity, userRepository: UserRepository) {
  const { password, ...rest } = userToCreate

  const user = await userRepository.create({
    ...rest,
    password: await hashPassword(password),
  })

  return await createUserStatefulTokenUseCase(user)
}
