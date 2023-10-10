import { Request, Response } from 'express'
import { carRepository } from '../repositories'
import asyncController from '../lib/async-controller'

const carsListController = asyncController(async (_: Request, res: Response) => {
  const cars = await carRepository.findAll()

  res.send(cars)
})

export default carsListController
