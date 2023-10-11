import bcrypt from 'bcrypt'
import { hashPassword, compareHashedPassword } from './password'

jest.mock('bcrypt')

describe('Password utility functions', () => {
  describe('hashPassword', () => {
    it('should return hashed password', async () => {
      const mockPassword = 'password123'
      const mockHashedPassword = 'hashedPassword123'
      ;(bcrypt.hash as jest.Mock).mockResolvedValueOnce(mockHashedPassword)
      ;(bcrypt.genSalt as jest.Mock).mockResolvedValueOnce('salt')

      const result = await hashPassword(mockPassword)
      expect(result).toBe(mockHashedPassword)
      expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 'salt')
    })
  })

  describe('compareHashedPassword', () => {
    it('should return true if plain password matches hashed password', async () => {
      const mockPlainPassword = 'password123'
      const mockHashedPassword = 'hashedPassword123'
      ;(bcrypt.compare as jest.Mock).mockResolvedValueOnce(true)

      const result = await compareHashedPassword(mockPlainPassword, mockHashedPassword)
      expect(result).toBe(true)
      expect(bcrypt.compare).toHaveBeenCalledWith(mockPlainPassword, mockHashedPassword)
    })

    it('should return false if plain password does not match hashed password', async () => {
      const mockPlainPassword = 'password123'
      const mockHashedPassword = 'hashedPassword123'
      ;(bcrypt.compare as jest.Mock).mockResolvedValueOnce(false)

      const result = await compareHashedPassword(mockPlainPassword, mockHashedPassword)
      expect(result).toBe(false)
      expect(bcrypt.compare).toHaveBeenCalledWith(mockPlainPassword, mockHashedPassword)
    })
  })
})
