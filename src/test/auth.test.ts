import request from 'supertest'
import { Application } from 'express'
import { Server } from 'http'
import { createTestServer } from './helpers'

describe('auth', () => {
  let app: Application
  let server: Server

  beforeAll(async () => {
    const testServer = await createTestServer()
    app = testServer.app
    server = testServer.server
  })

  it('request with required token but without authorization headers should return a unauthorized error', async () => {
    const response = await request(app).delete('/api/user/1000')

    expect(response.status).toBe(401)
    expect(response.body.error.reasons).toContain('Missing header "Authorization" with token.')
  })

  afterAll(() => {
    server.close()
  })
})
