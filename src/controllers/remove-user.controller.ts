import { Request, Response } from 'express'
import asyncController from '../lib/async-controller'
import adminRemoveUserUseCase from '../use-cases/admin-remove-user.use-case'
import { userRepository } from '../repositories'
import { z } from 'zod'
import { UserEntity } from '../entities/user.entity'

const ParamsValidator = z.object({
  id: z.string().uuid(),
})

const removeUserController = asyncController(async (req: Request, res: Response) => {
  const params = ParamsValidator.parse(req.params)

  await adminRemoveUserUseCase(req.user?.id as UserEntity['id'], params.id, userRepository)

  res.send()
})

export default removeUserController
