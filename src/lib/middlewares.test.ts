import { NextFunction, Request, Response } from 'express'
import { ForbiddenError, UnauthorizedError } from '../error-handler'
import { verifyToken } from './token'
import { UserRole } from '../entities/user.entity'
import { userRepository } from '../repositories'
import { UserNotFoundError } from '../repositories/user.repository'
import { EXPIRED_TOKEN_ERROR_MESSAGE } from './constants'
import { withSession, onlyAdmin } from './middlewares'

jest.mock('./token')
jest.mock('../repositories')

describe('Middleware functions', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    req = {
      headers: {},
    }
    res = {}
    next = jest.fn()
  })

  describe('withSession', () => {
    it('should return UnauthorizedError if Authorization header is missing', async () => {
      await withSession(req as Request, res as Response, next)
      expect(next).toHaveBeenCalledWith(new UnauthorizedError(['Missing header "Authorization" with token.']))
    })

    it('should set user in request if token is valid', async () => {
      const mockToken = 'Bearer mockToken'
      req.headers = { authorization: mockToken }
      ;(verifyToken as jest.Mock).mockResolvedValueOnce({ id: 'mockUserId' })
      ;(userRepository.findById as jest.Mock).mockResolvedValueOnce({ role: UserRole.ADMIN })

      await withSession(req as Request, res as Response, next)
      expect(req.user).toEqual({ id: 'mockUserId', role: UserRole.ADMIN })
      expect(next).toHaveBeenCalledWith()
    })

    it('should return UnauthorizedError if user is not found', async () => {
      const mockToken = 'Bearer mockToken'
      req.headers = { authorization: mockToken }
      ;(verifyToken as jest.Mock).mockResolvedValueOnce({ id: 'mockUserId' })
      ;(userRepository.findById as jest.Mock).mockRejectedValueOnce(new UserNotFoundError())

      await withSession(req as Request, res as Response, next)
      expect(next).toHaveBeenCalledWith(new UnauthorizedError([EXPIRED_TOKEN_ERROR_MESSAGE]))
    })

    it('should pass error to next if any other error occurs', async () => {
      const mockToken = 'Bearer mockToken'
      req.headers = { authorization: mockToken }
      const mockError = new Error('mockError')
      ;(verifyToken as jest.Mock).mockRejectedValueOnce(mockError)

      await withSession(req as Request, res as Response, next)
      expect(next).toHaveBeenCalledWith(mockError)
    })
  })

  describe('onlyAdmin', () => {
    it('should return UnauthorizedError if session is missing', async () => {
      await onlyAdmin(req as Request, res as Response, next)
      expect(next).toHaveBeenCalledWith(new UnauthorizedError(['Missing session.']))
    })

    it('should return ForbiddenError if user role is not ADMIN', async () => {
      req.user = { id: 'mockUserId', role: UserRole.CUSTOMER }
      await onlyAdmin(req as Request, res as Response, next)
      expect(next).toHaveBeenCalledWith(new ForbiddenError(['Action only for admin users.']))
    })

    it('should call next without error if user role is ADMIN', async () => {
      req.user = { id: 'mockUserId', role: UserRole.ADMIN }
      await onlyAdmin(req as Request, res as Response, next)
      expect(next).toHaveBeenCalledWith()
    })
  })
})
