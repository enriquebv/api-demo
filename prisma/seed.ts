import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

async function seedAdmin() {
  await prisma.user.create({
    data: { name: 'Admin', email: 'admin@test.com', role: 'ADMIN', password: await hashPassword('admin') },
  })
}

seedAdmin()
