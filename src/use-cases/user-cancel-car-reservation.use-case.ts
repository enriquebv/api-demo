import { ReservationEntity } from '../entities/reservation.entity'
import { UserEntity, UserRole } from '../entities/user.entity'
import { WithoutPermissionError } from '../lib/base-errors'
import { reservationRepository, userRepository } from '../repositories'

export class CanNotCancelReservationError extends WithoutPermissionError {
  constructor() {
    super('Without permissions to cancel this reservation.')
  }
}

export class AlreadyCancelledReservationError extends Error {
  constructor() {
    super('Already cancelled reservation.')
  }
}

export default async function userCancelCarReservationUseCase(
  cancellingUserId: UserEntity['id'],
  reservationId: ReservationEntity['id']
): Promise<void> {
  const user = await userRepository.findById(cancellingUserId)
  const reservation = await reservationRepository.findById(reservationId)

  if (reservation.cancelled) {
    throw new AlreadyCancelledReservationError()
  }

  const canCancel = user.role === UserRole.ADMIN || reservation.customer?.id === cancellingUserId

  if (!canCancel) {
    throw new CanNotCancelReservationError()
  }

  await reservationRepository.cancel(reservationId)
}
