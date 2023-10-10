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

  beforeAll(async () => {
    const testServer = await createTestServer()
    app = testServer.app
    server = testServer.server
    userToken = await getUserToken(CUSTOMER_ID)
  })

  it('/car/:id/reserve reserve car when has no overlaped reservations', async () => {
    const response = await request(app)
      .post(`/api/car/${CAR_ID}/reserve`)
      .set({ Authorization: `Bearer ${userToken}` })
      .send({
        range: {
          start: '2023-03-15T00:00:00.000Z',
          end: '2023-07-15T00:00:00.000Z',
        },
      })

    expect(response.status).toBe(200)
  })

  it('/car/:id/reserve reserve fails with 409 conflict when has overlaped reservations', async () => {
    const response = await request(app)
      .post(`/api/car/${CAR_ID}/reserve`)
      .set({ Authorization: `Bearer ${userToken}` })
      .send({
        range: {
          start: '2023-03-15T00:00:00.000Z',
          end: '2023-07-15T00:00:00.000Z',
        },
      })

    expect(response.status).toBe(409)
    expect(response.body).toMatchSchema(API_ERROR_SCHEMA)
    expect(response.body.error.reasons).toContain('Reservation failed: car is already reserved.')
  })

  afterAll(() => {
    server.close()
  })
})
