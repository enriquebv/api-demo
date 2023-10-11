import 'tsconfig-paths/register'

import { PrismaClient } from '@prisma/client'
import { ADMIN_ID, CAR_ID, CUSTOMER_ID } from './fixtures'

const prisma = new PrismaClient()

// Note: We do not need to remove "Reservation" data inserted
// by tests, because onCascade constraints will do the work for us.

export default async function globalTeardown() {
  await prisma.$transaction([
    prisma.car.delete({ where: { id: CAR_ID } }),
    prisma.user.delete({ where: { id: CUSTOMER_ID } }),
    prisma.user.delete({ where: { id: ADMIN_ID } }),
  ])

  await prisma.$disconnect()
}
