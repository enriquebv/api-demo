import { User, UserRole as PrismaUserRole } from '@prisma/client'
import { UserEntity, UserRole } from '../entities/user.entity'

export function prismaUserRoleToEntityUserRole(role: User['role']): UserEntity['role'] {
  const ROLES_DICTIONARY = {
    [PrismaUserRole.ADMIN]: UserRole.ADMIN,
    [PrismaUserRole.CUSTOMER]: UserRole.CUSTOMER,
  }

  return ROLES_DICTIONARY[role]
}

export function entityUserRoleToPrismaUserRole(role: UserEntity['role']): User['role'] {
  const ROLES_DICTIONARY = {
    [UserRole.ADMIN]: PrismaUserRole.ADMIN,
    [UserRole.CUSTOMER]: PrismaUserRole.CUSTOMER,
  }

  return ROLES_DICTIONARY[role]
}
