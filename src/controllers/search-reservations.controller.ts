import { Request, Response } from 'express'
import { z } from 'zod'
import asyncController from '../lib/async-controller'
import { UserRole } from '../entities/user.entity'
import { ForbiddenError } from '../error-handler'
import { reservationRepository } from '../repositories'
import { FindManyFields } from '../repositories/reservation.repository'

const SearchReservationsQueryValidator = z.object({
  startsAfter: z.string().datetime().optional(),
  endsBefore: z.string().datetime().optional(),
  car: z.union([z.string().uuid(), z.string().uuid().array()]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  cancelled: z.coerce.boolean().optional(),
  description: z.string().optional(),
})

const searchReservationsController = asyncController(async (req: Request, res: Response) => {
  const user = req.user

  if (!user) {
    throw new ForbiddenError(['Can not search without a session.'])
  }

  const query = SearchReservationsQueryValidator.parse(req.query)
  const fields: FindManyFields = {
    date: {
      start: query.startsAfter ? new Date(query.startsAfter) : undefined,
      end: query.endsBefore ? new Date(query.endsBefore) : undefined,
    },
    price: {
      min: query.minPrice,
      max: query.maxPrice,
    },
    cars: typeof query.car === 'string' ? [query.car] : query.car,
    cancelled: query.cancelled,
    customerId: user.role !== UserRole.ADMIN ? user.id : undefined,
    description: query.description,
  }

  const reservations = await reservationRepository.findMany(fields)

  res.send(reservations)
})

export default searchReservationsController
