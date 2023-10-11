import { calculateReservationPrice, ReservationDaysIsBelowMinimum } from './reservation'

describe('Reservation utility functions', () => {
  describe('calculateReservationPrice', () => {
    it('should throw an error if reservation days is below minimum', () => {
      const mockRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-15'),
      }
      const mockCar = {
        pricePerMonth: 1000,
      }

      expect(() => calculateReservationPrice(mockRange, mockCar as any)).toThrow(ReservationDaysIsBelowMinimum)
      expect(() => calculateReservationPrice(mockRange, mockCar as any)).toThrow(
        'Reservation should be at least 30 days.'
      )
    })

    it('should calculate reservation price for exact one month', () => {
      const mockRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      }
      const mockCar = {
        pricePerMonth: 1000,
      }

      const result = calculateReservationPrice(mockRange, mockCar as any)
      expect(result).toBe(1000)
    })

    it('should calculate reservation price for more than one month', () => {
      const mockRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-03-01'),
      }
      const mockCar = {
        pricePerMonth: 1000,
      }

      const result = calculateReservationPrice(mockRange, mockCar as any)
      expect(result).toBe(2000) // 2 months
    })
  })
})
