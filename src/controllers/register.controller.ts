import { Request, Response } from 'express'
import { z } from 'zod'
import registerUseCase from '../use-cases/register.use-case'
import { userRepository } from '../repositories'
import { BadRequestError } from '../error-handler'
import { AlreadyUsedEmailError } from '../repositories/user.repository'
import asyncController from '../lib/async-controller'

// Explanation:
// - (?=.*[A-Z]): Positive lookahead to ensure there's at least one uppercase letter.
// - (?=.*\d): Positive lookahead to ensure there's at least one digit.
const PASSWORD_REGEXP = /^(?=.*[A-Z])(?=.*\d).+$/

const RegisterBodyValidator = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z
    .string()
    .min(4)
    .refine((password) => PASSWORD_REGEXP.test(password), 'Password must contain an uppercase and a number.'),
})

const registerController = asyncController(async (req: Request, res: Response) => {
  const body = RegisterBodyValidator.parse(req.body)

  try {
    const response = await registerUseCase(body, userRepository)
    res.send(response)
  } catch (error) {
    // Note: To avoid exposing if an email is used or not, we throw a generic error as bad request.
    // Tech debt: Use conflict error
    if (error instanceof AlreadyUsedEmailError) {
      throw new BadRequestError(['Registration failed.'])
    }
  }
})

export default registerController
