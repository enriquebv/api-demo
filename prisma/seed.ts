import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

async function main() {
  await seedUsers()
  await seedCars()
  await seedReservations()
}

main()

async function seedUsers() {
  await prisma.user.createMany({
    data: [
      { name: 'Admin', email: 'admin@test.com', role: 'ADMIN', password: await hashPassword('Admin1') },
      { name: 'Customer1', email: 'customer1@test.com', role: 'CUSTOMER', password: await hashPassword('Customer1') },
      { name: 'Customer2', email: 'customer2@test.com', role: 'CUSTOMER', password: await hashPassword('Customer2') },
      { name: 'Customer3', email: 'customer3@test.com', role: 'CUSTOMER', password: await hashPassword('Customer3') },
      { name: 'Customer4', email: 'customer4@test.com', role: 'CUSTOMER', password: await hashPassword('Customer4') },
    ],
  })
}

async function seedCars() {
  await prisma.car.createMany({
    data: [
      { name: 'Citroen C3 BlueHDi 100 75kW (102cv) S&S Shine', pricePerMonth: 358 },
      { name: 'Fiat 500 1.0 Hybrid 51kW (70cv) Dolcevita', pricePerMonth: 378 },
      { name: 'Opel Corsa GS 1.2T XHL 74kW (100cv) S/S', pricePerMonth: 385 },
      { name: 'Citroen C3 Aircross PureTech 110 85 kW (110cv) S&S 6v C Series', pricePerMonth: 405 },
      { name: 'Seat Ibiza 1.0 MPI 59kW (80cv) Start&Stop', pricePerMonth: 425 },
      { name: 'Peugeot 2008 PureTech 100 75kW (102cv) Active S&S 6 Vel.', pricePerMonth: 435 },
      { name: 'Seat Arona 1.0 TSI 81kW (110cv) Style XM', pricePerMonth: 498 },
      { name: 'ford Focus 1.0 Ecoboost MHEV 92kW (125cv) ST-Line', pricePerMonth: 545 },
      { name: 'MG ZS 1.5 VTi-Tech 78kW (106cv) Luxury', pricePerMonth: 555 },
      { name: 'Jeep Avenger 1,2 Turbo (100cv) Altitude ICE', pricePerMonth: 555 },
      { name: 'Toyota Yaris Cross 120H 82kW (116cv) ACTIVE TECH', pricePerMonth: 558 },
      { name: 'Jeep Compass 1.6 Multijet II (130cv) 4X2 Limited', pricePerMonth: 565 },
      { name: 'citroen C4 BlueHDi (130cv) S&S EAT8 Feel Pack', pricePerMonth: 578 },
      { name: 'skoda Scala 1.0 TSI 81KW (110 CV) DSG Ambition', pricePerMonth: 585 },
      { name: 'skoda KAMIQ 1.5 TSI 110kW (150CV) DSG STYLE', pricePerMonth: 635 },
      { name: 'BMW Serie 1 118i (136cv) Business Corporate', pricePerMonth: 635 },
      { name: 'Peugeot 2008 1.2 PURETECH 96kW (130cv) S&S ALLURE EAT8 ', pricePerMonth: 670 },
      { name: 'opel Grandland 1.5 CDTi GS Line Auto', pricePerMonth: 675 },
      { name: 'mini Cooper SE Electric (184cv) Classic', pricePerMonth: 675 },
      { name: 'Cupra Formentor 1.5 TSI 110 kW (150cv) DSG 7 vel', pricePerMonth: 748 },
      { name: 'tesla Model 3 Gran Autonomía', pricePerMonth: 1038 },
      { name: 'Peugeot 5008 1.2 PureTech 96KW (130cv) S&S Allure Pack EAT8', pricePerMonth: 760 },
      { name: 'Peugeot 5008 1.5 BlueHDi 96kW (130cv) S&S Allure Pack EAT8', pricePerMonth: 775 },
      { name: 'skoda Kodiaq 1.5 TSI (150cv) Ambition DSG 7 plazas', pricePerMonth: 780 },
      { name: 'skoda Octavia Combi 1.5 TSI 110kW DSG m-HEV Selection', pricePerMonth: 788 },
      { name: 'audi A3 Sportback S line 30 TDI 85kW S tronic', pricePerMonth: 788 },
      { name: 'DS 7 BlueHDi (130cv) PERFORMANCE LINE', pricePerMonth: 808 },
      { name: 'Peugeot 408 Allure Puretech 130 (130cv) S&S EAT8', pricePerMonth: 825 },
      { name: 'DS 7 E-TENSE 225 (225cv) PERFORMANCE LINE', pricePerMonth: 885 },
      { name: 'bmw X1  xDrive25e ', pricePerMonth: 1025 },
      { name: 'audi Q5 S line 35 TDI 120kW S tronic', pricePerMonth: 1205 },
      { name: 'audi Q5 SPORTBACK S line 35 TDI 120kW S tronic', pricePerMonth: 1245 },
      { name: 'Mercedes Benz EQA 250+ (190cv) AMG Line', pricePerMonth: 1315 },
      { name: 'bmw X3 xDrive30e xLine (292cv)', pricePerMonth: 1318 },
    ],
  })
}

async function seedReservations() {
  const cars = await prisma.car.findMany()
  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })

  await prisma.reservation.createMany({
    data: [
      {
        carId: cars[0].id,
        startsAt: new Date('2023-01-01T00:00:00.000Z'),
        endsAt: new Date('2023-02-01T00:00:00.000Z'),
        customerId: customers[0].id,
        priceAtReservation: 1000,
        description: 'Seeded reservation.',
      },
      {
        carId: cars[1].id,
        startsAt: new Date('2023-02-01T00:00:00.000Z'),
        endsAt: new Date('2023-06-01T00:00:00.000Z'),
        customerId: customers[1].id,
        priceAtReservation: 3000,
        description: 'Seeded reservation.',
      },
      {
        carId: cars[2].id,
        startsAt: new Date('2023-02-01T00:00:00.000Z'),
        endsAt: new Date('2023-06-01T00:00:00.000Z'),
        customerId: customers[1].id,
        priceAtReservation: 3000,
        description: 'Seeded reservation.',
      },
    ],
  })
}
