import { NextFunction, Request, Response } from 'express'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { ZodError } from 'zod'
import { UserNotFoundError } from './repositories/user.repository'
import { InvalidPasswordError } from './use-cases/login.use-case'

class HTTPError extends Error {
  code: string
  status: number

  constructor(code: string, status: number) {
    super(code)
    this.code = code
    this.status = status
  }
}

export class BadRequestError extends HTTPError {
  reasons: string[]

  constructor(reasons: string[]) {
    super('BadRequest', 400)
    this.reasons = reasons
  }
}

export class UnauthorizedError extends HTTPError {
  reasons: string[]

  constructor(reasons: string[]) {
    super('Unauthorized', 401)
    this.reasons = reasons
  }
}

export class ForbiddenError extends HTTPError {
  reasons: string[]

  constructor(reasons: string[]) {
    super('Forbidden', 403)
    this.reasons = reasons
  }
}

export default function expressErrorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'development') {
    console.error(error)
  }

  let status = 500
  const response: { error: { code: string; reasons?: string[] } } = {
    error: {
      code: 'InternalServerError',
    },
  }

  // Controlled exceptions
  if (error instanceof HTTPError) {
    status = error.status
    response.error = {
      code: error.code,
      reasons: (error as BadRequestError).reasons ?? undefined,
    }
  }

  // Validation exceptions
  if (error instanceof ZodError) {
    status = 400
    response.error = {
      code: 'BadRequest',
      reasons: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    }
  }

  const isUnauthorizedError =
    error instanceof InvalidPasswordError || error instanceof TokenExpiredError || error instanceof JsonWebTokenError

  if (isUnauthorizedError) {
    status = 401

    let reason = error.message

    if (error instanceof JsonWebTokenError) {
      reason = 'Token is not valid.'
    }

    if (error instanceof TokenExpiredError) {
      reason = `Token was expired at ${error.expiredAt.toISOString()}`
    }

    response.error = {
      code: 'Unauthorized',
      reasons: [reason],
    }
  }

  const isNotFoundError = error instanceof UserNotFoundError
  if (isNotFoundError) {
    status = 404
    response.error = {
      code: 'NotFound',
      reasons: [error.message],
    }
  }

  res.status(status).send(response)
}
