import { CarEntity } from '../entities/car.entity'
import { DateRange } from './common-types'

export class ReservationDaysIsBelowMinimum extends Error {
  constructor(minimum: number) {
    super(`Reservation should be at least ${minimum} days.`)
  }
}

const DAY_IN_MS = 86_400_000
const MONTH_IN_DAYS = 30

export function calculateReservationPrice(range: DateRange, car: CarEntity): number {
  const reservationDays = (range.end.valueOf() - range.start.valueOf()) / DAY_IN_MS

  if (reservationDays < MONTH_IN_DAYS) {
    throw new ReservationDaysIsBelowMinimum(MONTH_IN_DAYS)
  }

  const months = Math.ceil(reservationDays / MONTH_IN_DAYS)

  return car.pricePerMonth * months
}
