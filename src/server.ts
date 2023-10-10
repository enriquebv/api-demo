import express, { Router } from 'express'
import expressErrorHandler from './error-handler'

import loginController from './controllers/login.controller'
import registerController from './controllers/register.controller'
import removeUserController from './controllers/remove-user.controller'
import { withSession, onlyAdmin } from './lib/middlewares'
import { carsListController } from './controllers/cars-list.controller'
import customerReserveCarController from './controllers/customer-reserve-car.controller'
import userUpdateCarReserveController from './controllers/edit-car-reserve.controller'

export function createServer() {
  const app = express()

  app.use(express.json())
  app.disable('x-powered-by')

  const router = Router()

  router.post('/user/register', registerController)
  router.post('/user/login', loginController)
  router.delete('/user/:id', withSession, onlyAdmin, removeUserController)

  router.get('/car', carsListController)
  router.post('/car/:id/reservation', withSession, customerReserveCarController)

  router.put('/reservation/:id', withSession, userUpdateCarReserveController)

  app.use('/api', router)

  app.use(expressErrorHandler)

  return app
}
