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

  async findById(id: UserEntity['id']): Promise<UserEntity> {
    const found = await this.prisma.user.findFirst({
      where: { id },
    })

    if (found === null) {
      throw new UserNotFoundError()
    }

    return {
      id,
      name: found.name,
      email: found.email,
      password: found.password,
      role: this.prismaToEntityRole(found.role),
    }
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const found = await this.prisma.user.findFirst({
      where: { email },
    })

    if (found === null) {
      throw new UserNotFoundError()
    }

    const entity: UserEntity = {
      id: found.id,
      name: found.name,
      email: found.email,
      password: found.password,
      role: this.prismaToEntityRole(found.role),
    }

    return entity
  }

  async create(user: UserToCreateEntity): Promise<UserEntity> {
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

  async removeByEmail(email: string) {
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
