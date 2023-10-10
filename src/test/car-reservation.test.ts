import request from 'supertest'
import { Application } from 'express'
import { Server } from 'http'
import { createTestServer, getUserToken } from './helpers'
import { API_ERROR_SCHEMA } from './schemas'
import { matchers } from 'jest-json-schema'
import { CAR_ID, CUSTOMER_ID } from './fixtures'

expect.extend(matchers)

describe('car', () => {
  let app: Application
  let server: Server
  let userToken: string
  let lastReservationId: string

  beforeAll(async () => {
    const testServer = await createTestServer()
    app = testServer.app
    server = testServer.server
    userToken = await getUserToken(CUSTOMER_ID)
  })

  it('/car/:id/reservation returns not found if car not exists', async () => {
    const response = await request(app)
      .post(`/api/car/${CUSTOMER_ID}/reservation`)
      .set({ Authorization: `Bearer ${userToken}` })
      .send({
        description: 'Car reservation',
        range: {
          start: '2023-03-15T00:00:00.000Z',
          end: '2023-07-15T00:00:00.000Z',
        },
      })

    expect(response.status).toBe(404)
    expect(response.body.error.reasons).toContain('Car not found.')
  })

  it('/car/:id/reservation returns bad request if car id is not valid', async () => {
    const response = await request(app)
      .post(`/api/car/abc/reservation`)
      .set({ Authorization: `Bearer ${userToken}` })
      .send({
        range: {
          start: '2023-03-15T00:00:00.000Z',
          end: '2023-07-15T00:00:00.000Z',
        },
      })

    expect(response.status).toBe(400)
    expect(response.body.error.reasons).toContain('id: Invalid uuid')
  })

  // Tech debt: uuid validation and dates validation are not merged, review.
  it('/car/:id/reservation returns bad request if car date are not valid', async () => {
    const response = await request(app)
      .post(`/api/car/${CAR_ID}/reservation`)
      .set({ Authorization: `Bearer ${userToken}` })
      .send({
        range: {
          start: 'abc',
          end: 'xyz',
        },
      })

    expect(response.status).toBe(400)
    expect(response.body.error.reasons).toContain('range.start: Invalid datetime')
    expect(response.body.error.reasons).toContain('range.end: Invalid datetime')
  })

  it('/car/:id/reservation reserve car when has no overlaped reservations', async () => {
    const response = await request(app)
      .post(`/api/car/${CAR_ID}/reservation`)
      .set({ Authorization: `Bearer ${userToken}` })
      .send({
        description: 'Car reservation',
        range: {
          start: '2023-03-15T00:00:00.000Z',
          end: '2023-07-15T00:00:00.000Z',
        },
      })

    lastReservationId = response.body.id
    expect(response.status).toBe(200)
  })

  it('/car/:id/reservation reserve fails with 409 conflict when has overlaped reservations', async () => {
    const response = await request(app)
      .post(`/api/car/${CAR_ID}/reservation`)
      .set({ Authorization: `Bearer ${userToken}` })
      .send({
        description: 'Car reservation',
        range: {
          start: '2023-03-15T00:00:00.000Z',
          end: '2023-07-15T00:00:00.000Z',
        },
      })

    expect(response.status).toBe(409)
    expect(response.body).toMatchSchema(API_ERROR_SCHEMA)
    expect(response.body.error.reasons).toContain('Reservation failed: car is already reserved.')
  })

  it('/reservation/:id fails with 400 if body is empty', async () => {
    const response = await request(app)
      .put(`/api/reservation/${lastReservationId}`)
      .set({ Authorization: `Bearer ${userToken}` })
      .send({})

    expect(response.status).toBe(400)
    expect(response.body).toMatchSchema(API_ERROR_SCHEMA)
    expect(response.body.error.reasons).toContain('body: Body can not be empty.')
  })

  it('/reservation/:id success with 200 if body is correct', async () => {
    const response = await request(app)
      .put(`/api/reservation/${lastReservationId}`)
      .set({ Authorization: `Bearer ${userToken}` })
      .send({
        description: 'Car updated',
        range: {
          start: '2023-03-15T00:00:00.000Z',
          end: '2023-07-15T00:00:00.000Z',
        },
      })

    expect(response.status).toBe(200)
  })

  afterAll(() => {
    server.close()
  })
})
