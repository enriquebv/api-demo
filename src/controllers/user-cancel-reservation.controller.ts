import { Request, Response } from 'express'
import asyncController from '../lib/async-controller'
import { UserEntity } from '../entities/user.entity'
import { z } from 'zod'
import userCancelCarReservationUseCase, {
  AlreadyCancelledReservationError,
} from '../use-cases/user-cancel-car-reservation.use-case'
import { HTTPError } from '../error-handler'

// Tech debt: Reuse this param validator
const CancelReservationParamsValidator = z.object({
  id: z.string().uuid(),
})

const userCancelReservationController = asyncController(async (req: Request, res: Response) => {
  const cancellingUserId = req.user?.id as UserEntity['id']
  const { id: reservationId } = CancelReservationParamsValidator.parse(req.params)

  try {
    await userCancelCarReservationUseCase(cancellingUserId, reservationId)
    res.send()
  } catch (error) {
    if (error instanceof AlreadyCancelledReservationError) {
      throw new HTTPError('Gone', 410, [error.message])
    }

    throw error
  }
})

export default userCancelReservationController
