import { PrismaClient } from '@prisma/client'
import { UserEntity } from '../entities/user.entity'
import { ReservationEntity } from '../entities/reservation.entity'
import { prismaUserRoleToEntityUserRole } from './helpers'
import { NotFoundError } from '../lib/base-errors'
import { DateRange } from '../lib/common-types'
import { CarEntity } from '../entities/car.entity'

export class ReservationNotFound extends NotFoundError {
  constructor() {
    super('Reservation not found.')
  }
}

export type UpdatableReservation = Partial<
  Pick<ReservationEntity, 'startsAt' | 'endsAt' | 'carId' | 'description' | 'priceAtReservation'>
>

export interface FindManyFields {
  date?: Partial<DateRange>
  price?: Partial<{ min: number; max: number }>
  cars?: CarEntity['id'][]
  cancelled?: boolean
  customerId?: UserEntity['id']
}

export default class ReservationRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: UserEntity['id']): Promise<ReservationEntity> {
    const reservation = await this.prisma.reservation.findFirst({ where: { id }, include: { customer: true } })

    if (reservation === null) {
      throw new ReservationNotFound()
    }

    // Tech debt: Use mappers/dtos to transform prisma to entities
    return {
      id: reservation.id,
      description: reservation.description,
      startsAt: reservation.startsAt,
      endsAt: reservation.endsAt,
      priceAtReservation: reservation.priceAtReservation,
      carId: reservation.carId,
      cancelled: reservation.cancelled,
      customer: { ...reservation.customer, role: prismaUserRoleToEntityUserRole(reservation.customer.role) },
    }
  }

  // Tech debt: missing return signature
  async update(id: ReservationEntity['id'], data: UpdatableReservation) {
    const reservation = await this.prisma.reservation.update({
      where: { id },
      data,
    })

    return {
      id: reservation.id,
      startsAt: reservation.startsAt,
      endsAt: reservation.endsAt,
      priceAtReservation: reservation.priceAtReservation,
      carId: reservation.carId,
    }
  }

  async cancel(id: ReservationEntity['id']) {
    await this.prisma.reservation.update({ where: { id }, data: { cancelled: true } })
  }

  async findMany(fields: FindManyFields): Promise<ReservationEntity[]> {
    console.log({ startsAt: { gte: fields.date?.start }, endsAt: { lte: fields.date?.end } })
    const list = await this.prisma.reservation.findMany({
      where: {
        startsAt: { gte: fields.date?.start },
        endsAt: { lte: fields.date?.end },
        priceAtReservation: {
          gte: fields.price?.min,
          lte: fields.price?.max,
        },
        customerId: fields.customerId,
        cancelled: fields.cancelled,
        ...(fields.cars ? { carId: { in: fields.cars } } : {}),
      },
    })

    return list.map((reservation) => ({
      id: reservation.id,
      startsAt: reservation.startsAt,
      endsAt: reservation.endsAt,
      priceAtReservation: reservation.priceAtReservation,
      carId: reservation.carId,
      description: reservation.description,
      cancelled: reservation.cancelled,
    }))
  }
}
