import { CarEntity } from '../entities/car.entity'
import { ReservationEntity } from '../entities/reservation.entity'
import { UserEntity } from '../entities/user.entity'
import { DateRange } from '../lib/common-types'
import { carRepository } from '../repositories'

export class CarReservationIntentWithOverlapError extends Error {
  constructor() {
    super('Reservation failed: car is already reserved.')
  }
}

export class ReservationDaysIsBelowMinimum extends Error {
  constructor(minimum: number) {
    super(`Reservation should be at least ${minimum} days.`)
  }
}

const DAY_IN_MS = 86_400_000
const MONTH_IN_DAYS = 30

export default async function customerReserveCarUseCase(
  customerId: UserEntity['id'],
  description: string,
  carId: CarEntity['id'],
  range: DateRange
): Promise<ReservationEntity> {
  const car = await carRepository.findRelatedReservationsByRange(carId, range)

  if (car.reservations?.length !== 0) {
    throw new CarReservationIntentWithOverlapError()
  }

  const reservationDays = (range.end.valueOf() - range.start.valueOf()) / DAY_IN_MS

  if (reservationDays < MONTH_IN_DAYS) {
    throw new ReservationDaysIsBelowMinimum(MONTH_IN_DAYS)
  }

  const months = Math.ceil(reservationDays / MONTH_IN_DAYS)
  const price = car.pricePerMonth * months

  return await carRepository.saveCustomerReservation(customerId, carId, price, range, description)
}
