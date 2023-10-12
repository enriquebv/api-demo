import { ReservationEntity } from '../entities/reservation.entity'
import { UserEntity, UserRole } from '../entities/user.entity'
import { ExpiredError, WithoutPermissionError } from '../lib/base-errors'
import { DateRange } from '../lib/common-types'
import { calculateReservationPrice } from '../lib/reservation'
import { carRepository, reservationRepository, userRepository } from '../repositories'
import { UpdatableReservation } from '../repositories/reservation.repository'

export class CanNotUpdateReservationError extends WithoutPermissionError {
  constructor() {
    super('Without permissions to update this reservation.')
  }
}

export class CanNotUpdateCancelledReservationError extends ExpiredError {
  constructor() {
    super('Can not update cancelled reservation')
  }
}

export default async function userUpdateCarReservationUseCase(
  userUpdatingId: UserEntity['id'],
  reservationId: ReservationEntity['id'],
  data: UpdatableReservation
) {
  const userUpdating = await userRepository.findById(userUpdatingId)
  const reservation = await reservationRepository.findById(reservationId)

  if (reservation.cancelled) {
    throw new CanNotUpdateCancelledReservationError()
  }

  const canUpdate = userUpdating.role === UserRole.ADMIN || reservation.customer?.id === userUpdatingId

  if (!canUpdate) {
    throw new CanNotUpdateReservationError()
  }

  // Tech debt: Create and update can be the same operation, and need the same procedure:
  // - Check if car is free to be booked at desired date
  // - Calculate prices
  // This is enough reason to centralize the operations and avoid repetitions.

  const car = await carRepository.findById(data.carId ?? reservation.carId)
  const range: DateRange = {
    start: data.startsAt ?? reservation.startsAt,
    end: data.endsAt ?? reservation.endsAt,
  }
  const updatable: UpdatableReservation = {
    ...data,
    priceAtReservation: calculateReservationPrice(range, car),
  }

  return await reservationRepository.update(reservationId, updatable)
}
