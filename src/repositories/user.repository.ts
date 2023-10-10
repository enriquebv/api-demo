import { PrismaClient, UserRole as PrismaUserRole, User } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { PrismaErrorCodes } from '../lib/constants'
import { UserEntity, UserRole, UserToCreateEntity } from '../entities/user.entity'
import { entityUserRoleToPrismaUserRole, prismaUserRoleToEntityUserRole } from './helpers'
import { NotFoundError } from '../lib/base-errors'

export class AlreadyUsedEmailError extends Error {
  constructor(email: string) {
    super(`Email ${email} already used.`)
  }
}

export class UserNotFoundError extends NotFoundError {
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
      role: prismaUserRoleToEntityUserRole(found.role),
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
      role: prismaUserRoleToEntityUserRole(found.role),
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
        role: prismaUserRoleToEntityUserRole(role),
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

  async setRole(id: UserEntity['id'], role: UserRole) {
    await this.prisma.user.update({ where: { id }, data: { role: entityUserRoleToPrismaUserRole(role) } })
  }

  async removeById(id: UserEntity['id']) {
    try {
      await this.prisma.user.delete({ where: { id } })
    } catch (error) {
      const isRecordNotExistError =
        error instanceof PrismaClientKnownRequestError && error.code === PrismaErrorCodes.RECORD_NOT_EXIST

      if (isRecordNotExistError) {
        throw new UserNotFoundError()
      }

      throw error
    }
  }

  async removeByEmail(email: string) {
    try {
      await this.prisma.user.delete({ where: { email } })
    } catch (error) {
      const isRecordNotExistError =
        error instanceof PrismaClientKnownRequestError && error.code === PrismaErrorCodes.RECORD_NOT_EXIST

      if (isRecordNotExistError) {
        throw new UserNotFoundError()
      }

      throw error
    }
  }
}
