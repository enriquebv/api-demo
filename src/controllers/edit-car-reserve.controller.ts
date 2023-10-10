import { Request, Response } from 'express'
import asyncController from '../lib/async-controller'
import { UserEntity } from '../entities/user.entity'
import userUpdateCarReserve, { CanNotUpdateReservation } from '../use-cases/user-udpate-car-reserve.use-case'
import { z } from 'zod'
import { ForbiddenError } from '../error-handler'

const UpdateCarParamsValidator = z.object({
  id: z.string().uuid(),
})

const UpdateCarBodyValidator = z
  .object({
    range: z
      .object({
        start: z.string().datetime().optional(),
        end: z.string().datetime().optional(),
      })
      .optional(),
    carId: z.string().optional(),
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Note we need at least one property to execute an update.
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Body can not be empty.',
        path: ['body'],
      })
    }
  })

const userUpdateCarReserveController = asyncController(async (req: Request, res: Response) => {
  const userUpdatingId = req.user?.id as UserEntity['id']
  const { id: reservationId } = UpdateCarParamsValidator.parse(req.params)
  const { range, carId, description } = UpdateCarBodyValidator.parse(req.body)

  try {
    const reservation = await userUpdateCarReserve(userUpdatingId, reservationId, {
      carId,
      description,
      startsAt: range?.start ? new Date(range.start) : undefined,
      endsAt: range?.end ? new Date(range.end) : undefined,
    })
    res.send(reservation)
  } catch (error) {
    if (error instanceof CanNotUpdateReservation) {
      throw new ForbiddenError([error.message])
    }

    throw error
  }
})

export default userUpdateCarReserveController
