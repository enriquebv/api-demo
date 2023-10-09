import { z } from 'zod'
import asyncController from '../lib/async-controller'
import loginUseCase, { InvalidPasswordError } from '../use-cases/login.use-case'
import { userRepository } from '../repositories'
import { UnauthorizedError } from '../error-handler'

const LoginBodyValidator = z.object({
  email: z.string(),
  password: z.string(),
})

const loginController = asyncController(async (req, res) => {
  const body = LoginBodyValidator.parse(req.body)

  try {
    const response = await loginUseCase(body, userRepository)

    res.send(response)
  } catch (error) {
    if (error instanceof InvalidPasswordError) {
      throw new UnauthorizedError(['Invalid password'])
    }

    throw error
  }
})

export default loginController
