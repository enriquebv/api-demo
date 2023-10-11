import jwt from 'jsonwebtoken'
import getEnvVariable from './env'
import { buildToken, verifyToken } from './token'

jest.mock('jsonwebtoken')
jest.mock('./env')

describe('JWT utility functions', () => {
  const mockJWT_SECRET = 'mock-secret'

  beforeAll(() => {
    ;(getEnvVariable as jest.Mock).mockReturnValue(mockJWT_SECRET)
  })

  describe('buildToken', () => {
    it('should build a token and return it with its expiration date', async () => {
      const mockPayload = { data: 'test' }
      const mockToken = 'mockToken'
      const mockExpirationDate = new Date()

      ;(jwt.sign as jest.Mock).mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken)
      })
      ;(jwt.decode as jest.Mock).mockReturnValue({ exp: mockExpirationDate.getTime() / 1000 })

      const result = await buildToken(mockPayload)
      expect(result).toEqual({
        token: mockToken,
        expiresAt: mockExpirationDate,
      })
    })

    it('should reject if there is an error during token creation', async () => {
      const mockError = new Error('mock error')
      ;(jwt.sign as jest.Mock).mockImplementation((payload, secret, options, callback) => {
        callback(mockError)
      })

      await expect(buildToken()).rejects.toThrow(mockError)
    })
  })

  describe('verifyToken', () => {
    it('should verify a token and return its content', async () => {
      const mockToken = 'mockToken'
      const mockDecoded = { data: 'test' }

      ;(jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(null, mockDecoded)
      })

      const result = await verifyToken(mockToken)
      expect(result).toEqual(mockDecoded)
    })

    it('should reject if there is an error during token verification', async () => {
      const mockToken = 'mockToken'
      const mockError = new Error('mock error')
      ;(jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(mockError)
      })

      await expect(verifyToken(mockToken)).rejects.toThrow(mockError)
    })
  })
})
