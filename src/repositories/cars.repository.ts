import { PrismaClient } from '@prisma/client'
import { CarEntity } from '../entities/car.entity'
import { DateRange } from '../lib/common-types'
import { UserEntity } from '../entities/user.entity'
import { ReservationEntity } from '../entities/reservation.entity'
import { NotFoundError } from '../lib/base-errors'

export class CarNotFoundError extends NotFoundError {
  constructor() {
    super(`Car not found.`)
  }
}

export default class CarRepository {
  constructor(private prisma: PrismaClient) {}

  async create(carToCreate: Omit<CarEntity, 'id' | 'reservations'>): Promise<CarEntity> {
    return await this.prisma.car.create({ data: carToCreate })
  }

  async findById(id: CarEntity['id']): Promise<CarEntity> {
    const car = await this.prisma.car.findFirst({ where: { id } })

    if (car === null) {
      throw new CarNotFoundError()
    }

    return car
  }

  async findAll(): Promise<CarEntity[]> {
    const cars = await this.prisma.car.findMany()

    return cars.map(({ id, name, pricePerMonth }) => ({ id, name, pricePerMonth }))
  }

  async findRelatedReservationsByRange(id: CarEntity['id'], range: DateRange): Promise<CarEntity> {
    const car = await this.prisma.car.findFirst({
      where: { id },
      include: {
        reservations: {
          where: {
            startsAt: { lte: range.end },
            endsAt: { gt: range.start },
          },
        },
      },
    })

    if (car === null) {
      throw new CarNotFoundError()
    }

    return {
      ...car,
      reservations: car.reservations.map((reservation) => ({
        id: reservation.id,
        description: reservation.description,
        startsAt: reservation.startsAt,
        endsAt: reservation.endsAt,
        priceAtReservation: reservation.priceAtReservation,
        carId: reservation.carId,
        cancelled: reservation.cancelled,
      })),
    }
  }

  async saveCustomerReservation(
    customerId: UserEntity['id'],
    carId: CarEntity['id'],
    priceAtReservation: number,
    range: DateRange,
    description: string
  ): Promise<ReservationEntity> {
    const reservation = await this.prisma.reservation.create({
      data: {
        description,
        customerId,
        carId: carId,
        priceAtReservation: priceAtReservation,
        startsAt: range.start,
        endsAt: range.end,
      },
    })

    return {
      id: reservation.id,
      description: reservation.description,
      startsAt: reservation.startsAt,
      endsAt: reservation.endsAt,
      priceAtReservation: reservation.priceAtReservation,
      carId: reservation.carId,
      cancelled: reservation.cancelled,
    }
  }
}
