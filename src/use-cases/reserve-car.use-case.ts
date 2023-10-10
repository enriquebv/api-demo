import { CarEntity } from '../entities/car.entity'
import { ReservationEntity } from '../entities/reservation.entity'
import { UserEntity } from '../entities/user.entity'
import { DateRange } from '../lib/common-types'
import { calculateReservationPrice } from '../lib/reservation'
import { carRepository } from '../repositories'

export class CarReservationIntentWithOverlapError extends Error {
  constructor() {
    super('Reservation failed: car is already reserved.')
  }
}

export class CanNotCheckReservationsError extends Error {
  constructor() {
    super('Can not check reservations.')
  }
}

export default async function customerReserveCarUseCase(
  customerId: UserEntity['id'],
  description: string,
  carId: CarEntity['id'],
  range: DateRange
): Promise<ReservationEntity> {
  const car = await carRepository.findRelatedReservationsByRange(carId, range)

  if (car.reservations === undefined) {
    throw new CanNotCheckReservationsError()
  }

  if (car.reservations.length !== 0) {
    throw new CarReservationIntentWithOverlapError()
  }

  const price = calculateReservationPrice(range, car)

  return await carRepository.saveCustomerReservation(customerId, carId, price, range, description)
}
