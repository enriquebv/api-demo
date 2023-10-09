import { UserEntity, UserRole } from '../entities/user.entity'
import UserRepository from '../repositories/user.repository'

class UserIsNotAdminError extends Error {
  constructor() {
    super('User is not admin.')
  }
}

export default async function adminRemoveUserUseCase(
  adminId: UserEntity['id'],
  userToRemoveId: UserEntity['id'],
  userRepository: UserRepository
) {
  const admin = await userRepository.findById(adminId)

  if (admin.role !== UserRole.ADMIN) {
    throw new UserIsNotAdminError()
  }

  await userRepository.removeById(userToRemoveId)
}
