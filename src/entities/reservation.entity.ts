import { CarEntity } from './car.entity'
import { UserEntity } from './user.entity'

export interface ReservationEntity {
  id: string
  description: string
  startsAt: Date
  endsAt: Date
  priceAtReservation: number
  carId: CarEntity['id']
  cancelled: boolean
  customer?: UserEntity
  car?: CarEntity
}
