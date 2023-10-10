import { ReservationEntity } from '../entities/reservation.entity'
import { UserEntity, UserRole } from '../entities/user.entity'
import { DateRange } from '../lib/common-types'
import { calculateReservationPrice } from '../lib/reservation'
import { carRepository, reservationRepository, userRepository } from '../repositories'
import { UpdatableReservation } from '../repositories/reservation.repository'

export class CanNotUpdateReservation extends Error {
  constructor() {
    super('Without permissions to update this reservation.')
  }
}

export default async function userUpdateCarReserve(
  userUpdatingId: UserEntity['id'],
  reservationId: ReservationEntity['id'],
  data: UpdatableReservation
) {
  const userUpdating = await userRepository.findById(userUpdatingId)
  const reservation = await reservationRepository.findById(reservationId)
  const canUpdate = userUpdating.role === UserRole.ADMIN || reservation.customer?.id === userUpdatingId

  if (!canUpdate) {
    throw new CanNotUpdateReservation()
  }

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
