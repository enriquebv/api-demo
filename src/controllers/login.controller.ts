import { z } from 'zod'
import asyncController from '../lib/async-controller'
import loginUseCase from '../use-cases/login.use-case'
import { userRepository } from '../repositories'

const LoginBodyValidator = z.object({
  email: z.string(),
  password: z.string(),
})

const loginController = asyncController(async (req, res) => {
  const body = LoginBodyValidator.parse(req.body)
  const response = await loginUseCase(body, userRepository)

  res.send(response)
})

export default loginController
