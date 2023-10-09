import { NextFunction, Request, Response } from 'express'
import { ForbiddenError, UnauthorizedError } from '../error-handler'
import { verifyToken } from './token'
import { UserRole } from '../entities/user.entity'

export async function withSession(req: Request, res: Response, next: NextFunction) {
  const bearer = req.headers.authorization as string

  if (!bearer) {
    return next(new UnauthorizedError(['Missing header "Authorization" with token.']))
  }

  const token = bearer.split(' ')[1]

  try {
    const session = await verifyToken<{ id: number; role: UserRole }>(token)

    req.user = {
      id: session.id,
      role: session.role,
    }

    next()
  } catch (error) {
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
