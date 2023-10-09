import { PrismaClient, User } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { PrismaErrorCodes } from '../lib/enums'
import { UserEntity, UserRole, UserToCreateEntity } from '../entities/user.entity'

export class AlreadyUsedEmailError extends Error {
  constructor(email: string) {
    super(`Email ${email} already used.`)
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('User not found.')
  }
}

export default class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async createUser(user: UserToCreateEntity): Promise<UserEntity> {
    try {
      const { id, name, email, role, password } = await this.prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
        },
      })

      return {
        id,
        name,
        email,
        password,
        role: this.prismaToEntityRole(role),
      }
    } catch (error) {
      const isEmailUniqueError =
        error instanceof PrismaClientKnownRequestError &&
        error.code === PrismaErrorCodes.UNIQUE &&
        (error.meta?.target as string[]).includes('email')

      if (isEmailUniqueError) {
        throw new AlreadyUsedEmailError(user.email)
      }

      throw error
    }
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    const stored = await this.prisma.user.findFirst({
      where: { email },
    })

    if (stored === null) {
      throw new UserNotFoundError()
    }

    const entity: UserEntity = {
      id: stored.id,
      name: stored.name,
      email: stored.email,
      password: stored.password,
      role: this.prismaToEntityRole(stored.role),
    }

    return entity
  }

  async removeUserByEmail(email: string) {
    await this.prisma.user.delete({ where: { email } })
  }

  private prismaToEntityRole(prismaUserRole: User['role']): UserRole {
    const ROLES_DICTIONARY = {
      ADMIN: UserRole.ADMIN,
      USER: UserRole.USER,
    }

    return ROLES_DICTIONARY[prismaUserRole]
  }
}
