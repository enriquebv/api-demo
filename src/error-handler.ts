import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

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
    super('BadRequest', 401)
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

  res.status(status).send(response)
}
