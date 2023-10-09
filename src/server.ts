import express, { Router } from 'express'
import loginController from './controllers/login.controller'
import registerController from './controllers/register.controller'
import expressErrorHandler from './error-handler'

export function createServer() {
  const app = express()

  app.use(express.json())
  app.disable('x-powered-by')

  const router = Router()

  router.post('/user/register', registerController)
  router.post('/user/login', loginController)

  app.use('/api', router)

  app.use(expressErrorHandler)

  return app
}
