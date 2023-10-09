import { Request, Response } from 'express'
import { carRepository } from '../repositories'

export async function carsListController(_: Request, res: Response) {
  const cars = await carRepository.findAll()

  res.send(cars)
}
