import { PrismaClient, UserRole } from '@prisma/client'
import { hashPassword } from '../lib/password'
import { ADMIN_ID, ADMIN_FIXTURE, CUSTOMER_ID, CUSTOMER_REGISTRATION_FIXTURE, CAR_ID } from './fixtures'

const prisma = new PrismaClient()

export default async function globalSetup() {
  await prisma.$transaction([
    prisma.user.create({
      data: {
        id: CUSTOMER_ID,
        ...CUSTOMER_REGISTRATION_FIXTURE,
        password: await hashPassword(CUSTOMER_REGISTRATION_FIXTURE.password),
      },
    }),
    prisma.user.create({
      data: {
        id: ADMIN_ID,
        ...ADMIN_FIXTURE,
        role: UserRole.ADMIN,
        password: await hashPassword(ADMIN_FIXTURE.password),
      },
    }),
    prisma.car.create({
      data: {
        id: CAR_ID,
        name: 'Car Test',
        pricePerMonth: 100,
      },
    }),
  ])

  await prisma.$disconnect()
}
