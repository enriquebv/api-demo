import express, { Router } from 'express'
import expressErrorHandler from './error-handler'
import { withSession, onlyAdmin } from './lib/middlewares'

import loginController from './controllers/login.controller'
import registerController from './controllers/register.controller'
import removeUserController from './controllers/remove-user.controller'
import carListController from './controllers/cars-list.controller'
import customerReserveCarController from './controllers/customer-reserve-car.controller'
import userUpdateCarReservationController from './controllers/user-update-car-reservation.controller'
import userCancelReservationController from './controllers/user-cancel-reservation.controller'

export function createServer() {
  const app = express()

  app.use(express.json())
  app.disable('x-powered-by')

  const router = Router()

  router.post('/user/register', registerController)
  router.post('/user/login', loginController)
  router.delete('/user/:id', withSession, onlyAdmin, removeUserController)

  router.get('/car', carListController)
  router.post('/car/:id/reservation', withSession, customerReserveCarController)

  router.put('/reservation/:id', withSession, userUpdateCarReservationController)
  router.post('/reservation/:id/cancel', withSession, userCancelReservationController)

  app.use('/api', router)

  app.use(expressErrorHandler)

  return app
}
