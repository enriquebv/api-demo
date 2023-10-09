import { NextFunction, Request, Response } from 'express'
import { ForbiddenError, UnauthorizedError } from '../error-handler'
import { verifyToken } from './token'
import { UserEntity, UserRole } from '../entities/user.entity'
import { userRepository } from '../repositories'
import { UserNotFoundError } from '../repositories/user.repository'
import { EXPIRED_TOKEN_ERROR_MESSAGE } from './constants'

export async function withSession(req: Request, res: Response, next: NextFunction) {
  const bearer = req.headers.authorization as string

  if (!bearer) {
    return next(new UnauthorizedError(['Missing header "Authorization" with token.']))
  }

  const token = bearer.split(' ')[1]

  try {
    const session = await verifyToken<{ id: UserEntity['id'] }>(token)
    const user = await userRepository.findById(session.id)

    req.user = {
      id: session.id,
      role: user.role,
    }

    next()
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return next(new UnauthorizedError([EXPIRED_TOKEN_ERROR_MESSAGE]))
    }

    next(error)
  }
}

export async function onlyAdmin(req: Request, res: Response, next: NextFunction) {
  const role = req.user?.role

  if (role === undefined) {
    return next(new UnauthorizedError(['Missing session.']))
  }

  if (role !== UserRole.ADMIN) {
    return next(new ForbiddenError(['Action only for admin users.']))
  }

  next()
}
