import { NextFunction, Request, Response } from 'express'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { ZodError } from 'zod'
import { InvalidPasswordError } from './use-cases/login.use-case'
import { EXPIRED_TOKEN_ERROR_MESSAGE } from './lib/constants'
import { CarReservationIntentWithOverlapError } from './use-cases/reserve-car.use-case'
import { ExpiredError, NotFoundError } from './lib/base-errors'
import getEnvVariable from './lib/env'

export class HTTPError extends Error {
  constructor(public code: string, public status: number, public reasons: string[]) {
    super(code)
  }
}

export class BadRequestError extends HTTPError {
  constructor(reasons: string[]) {
    super('BadRequest', 400, reasons)
  }
}

export class UnauthorizedError extends HTTPError {
  constructor(reasons: string[]) {
    super('Unauthorized', 401, reasons)
  }
}

export class ForbiddenError extends HTTPError {
  constructor(reasons: string[]) {
    super('Forbidden', 403, reasons)
  }
}

export default function expressErrorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  if (getEnvVariable('NODE_ENV') === 'development') {
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
      reasons: error.reasons,
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
      reason = EXPIRED_TOKEN_ERROR_MESSAGE
    }

    response.error = {
      code: 'Unauthorized',
      reasons: [reason],
    }
  }

  if (error instanceof NotFoundError) {
    status = 404
    response.error = {
      code: 'NotFound',
      reasons: [error.message],
    }
  }

  const isConflictError = error instanceof CarReservationIntentWithOverlapError
  if (isConflictError) {
    status = 409
    response.error = {
      code: 'Conflict',
      reasons: [error.message],
    }
  }

  const isExpiredError = error instanceof ExpiredError
  if (isExpiredError) {
    status = 410
    response.error = {
      code: 'Gone',
      reasons: [error.message],
    }
  }

  res.status(status).send(response)
}
