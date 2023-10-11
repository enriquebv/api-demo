import { Request, Response, NextFunction } from 'express'
import asyncController from './async-controller'

describe('asyncController', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    req = {}
    res = {}
    next = jest.fn()
  })

  it('should call the controller method and not call next if there is no error', async () => {
    const mockController = jest.fn().mockResolvedValue(undefined)
    const wrappedController = asyncController(mockController)

    await wrappedController(req as Request, res as Response, next)
    expect(mockController).toHaveBeenCalledWith(req, res)
    expect(next).not.toHaveBeenCalled()
  })

  it('should call next with the error if the controller method throws an error', async () => {
    const mockError = new Error('mock error')
    const mockController = jest.fn().mockRejectedValue(mockError)
    const wrappedController = asyncController(mockController)

    await wrappedController(req as Request, res as Response, next)
    expect(mockController).toHaveBeenCalledWith(req, res)
    expect(next).toHaveBeenCalledWith(mockError)
  })
})
