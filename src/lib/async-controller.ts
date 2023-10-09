import { NextFunction, Request, Response } from 'express'

/**
 * Enables error handler usage for async controllers.
 * @example
 * async function method(req, res) {
 *   throw new Error('Unknown error') // Without asyncController, this error will not pass to error handler.
 *
 *   res.send('Unreacheable response')
 * }
 *
 * app.get('/endpoint', asyncController(method))
 */
export default function asyncController(controller: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => Promise.resolve(controller(req, res)).catch(next)
}
