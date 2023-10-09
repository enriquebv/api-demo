import { Request, Response } from 'express'
import asyncController from '../lib/async-controller'
import adminRemoveUserUseCase from '../use-cases/admin-remove-user.use-case'
import { userRepository } from '../repositories'
import { z } from 'zod'

const ParamsValidator = z.object({
  id: z.coerce.number(),
})

const removeUserController = asyncController(async (req: Request, res: Response) => {
  const params = ParamsValidator.parse(req.params)

  await adminRemoveUserUseCase(req.user?.id as number, params.id, userRepository)

  res.send()
})

export default removeUserController
