import { ReservationEntity } from './reservation.entity'

export interface CarEntity {
  id: string
  name: string
  pricePerMonth: number
  reservations?: ReservationEntity[]
}
