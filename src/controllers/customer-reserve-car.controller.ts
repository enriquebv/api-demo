import { Response, Request } from 'express'
import { z } from 'zod'
import asyncController from '../lib/async-controller'
import customerReserveCarUseCase, { ReservationDaysIsBelowMinimum } from '../use-cases/reserve-car.use-case'
import { UserEntity } from '../entities/user.entity'
import { BadRequestError, UnauthorizedError } from '../error-handler'

export const ISO_DATE_REGEX = /\d{4}-[01]\d-[0-3]\d/

const ReserveCarParamsValidator = z.object({
  id: z.string().uuid(),
})

const ReserveCarBodyValidator = z.object({
  range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  description: z.string().optional(),
})

const customerReserveCarController = asyncController(async (req: Request, res: Response) => {
  const { id: carId } = ReserveCarParamsValidator.parse(req.params)
  const {
    range: { start, end },
    description,
  } = ReserveCarBodyValidator.parse(req.body)
  const customerId = req.user?.id as UserEntity['id']
  const range = {
    start: new Date(start),
    end: new Date(end),
  }

  if (range.start.valueOf() > range.end.valueOf()) {
    throw new BadRequestError(['range.start can not be greater than range.end'])
  }

  try {
    const reservation = await customerReserveCarUseCase(customerId, description ?? '', carId, range)
    res.send(reservation)
  } catch (error) {
    if (error instanceof ReservationDaysIsBelowMinimum) {
      throw new UnauthorizedError([error.message])
    }

    throw error
  }
})

export default customerReserveCarController
