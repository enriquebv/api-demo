import { PrismaClient } from '@prisma/client'
import UserRepository from './user.repository'
import CarRepository from './cars.repository'

export const prisma = new PrismaClient()

export const userRepository = new UserRepository(prisma)
export const carRepository = new CarRepository(prisma)
