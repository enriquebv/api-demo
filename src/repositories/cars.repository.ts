import { PrismaClient } from '@prisma/client'
import { CarEntity } from '../entities/car.entity'

export default class CarRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<CarEntity[]> {
    const cars = await this.prisma.car.findMany()

    return cars.map(({ id, name, pricePerMonth }) => ({ id, name, pricePerMonth }))
  }
}
