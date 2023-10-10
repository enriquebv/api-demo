import { PrismaClient } from '@prisma/client'
import { UserEntity } from '../entities/user.entity'
import { ReservationEntity } from '../entities/reservation.entity'
import { prismaUserRoleToEntityUserRole } from './helpers'
import { NotFoundError } from '../lib/base-errors'

export class ReservationNotFound extends NotFoundError {
  constructor() {
    super('Reservation not found.')
  }
}

export type UpdatableReservation = Partial<
  Pick<ReservationEntity, 'startsAt' | 'endsAt' | 'carId' | 'description' | 'priceAtReservation'>
>

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
}
