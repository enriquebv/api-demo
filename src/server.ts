import https from 'https'
import express, { Router } from 'express'
import { certificateFor } from 'devcert'
import cors from 'cors'

import expressErrorHandler from './error-handler'
import { withSession, onlyAdmin } from './lib/middlewares'
import getEnvVariable from './lib/env'

import loginController from './controllers/login.controller'
import registerController from './controllers/register.controller'
import removeUserController from './controllers/remove-user.controller'
import carListController from './controllers/cars-list.controller'
import customerReserveCarController from './controllers/customer-reserve-car.controller'
import userUpdateCarReservationController from './controllers/user-update-car-reservation.controller'
import userCancelReservationController from './controllers/user-cancel-reservation.controller'
import searchReservationsController from './controllers/search-reservations.controller'

export function createServer() {
  const app = express()

  app.use(express.json())
  app.disable('x-powered-by')
  const origins = getEnvVariable('ALLOWED_ORIGINS').split(',')
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          return callback(new Error('Not allowed by CORS'))
        }

        if (!origins.includes(origin)) {
          return callback(new Error('Not allowed by CORS'))
        }

        callback(null, true)
      },
    })
  )

  const router = Router()

  router.post('/user/register', registerController)
  router.post('/user/login', loginController)
  router.delete('/user/:id', withSession, onlyAdmin, removeUserController)

  router.get('/car', carListController)
  router.post('/car/:id/reservation', withSession, customerReserveCarController)

  router.get('/reservation', withSession, searchReservationsController)
  router.put('/reservation/:id', withSession, userUpdateCarReservationController)
  router.post('/reservation/:id/cancel', withSession, userCancelReservationController)

  app.use('/api', router)

  app.use(expressErrorHandler)

  return app
}

const PORT = getEnvVariable('PORT')

export function startHttp() {
  const app = createServer()
  app.listen(PORT, () => console.log('Server running on http://localhost:%d', PORT))
}

export async function startHttps() {
  const app = createServer()
  const ssl = await certificateFor('localhost')

  https
    .createServer(
      {
        key: ssl.key,
        cert: ssl.cert,
      },
      app
    )
    .listen(PORT, () => console.log('Server running on https://localhost:%d', PORT))
}
