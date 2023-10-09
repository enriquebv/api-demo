import request from 'supertest'
import { Application } from 'express'
import { type Server } from 'http'
import { createServer } from './server'
import { matchersWithOptions } from 'jest-json-schema'
import { userRepository } from './repositories'

expect.extend(matchersWithOptions({ strict: true } as any))

const HTTP_TEST_PORT = 3333

const ERROR_SCHEMA = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        reasons: { type: 'array', items: { type: 'string' } },
      },
    },
  },
}

const LOGIN_FIXTURE = {
  email: 'test@test.test',
  password: 'Test1',
}

const REGISTRATION_FIXTURE = {
  name: 'test',
  ...LOGIN_FIXTURE,
}

describe('API integration tests', () => {
  let app: Application
  let server: Server

  beforeAll(async () => {
    async function setupServer() {
      app = createServer()

      return new Promise((resolve) => {
        server = app.listen(HTTP_TEST_PORT, () => resolve(undefined))
      })
    }

    await setupServer()
  })

  describe('/api/user', () => {
    const ENDPOINTS = {
      register() {
        return request(app).post('/api/user/register')
      },
      login() {
        return request(app).post('/api/user/login')
      },
    }

    it('/register should return bad request is body is empty', async () => {
      const response = await ENDPOINTS.register().send({})

      expect(response.status).toBe(400)
      expect(response.body).toMatchSchema(ERROR_SCHEMA)
      expect(response.body.error.reasons).toContain('name: Required')
      expect(response.body.error.reasons).toContain('email: Required')
      expect(response.body.error.reasons).toContain('password: Required')
    })

    it('/register should return bad request is email is not an email', async () => {
      const response = await ENDPOINTS.register().send({
        ...REGISTRATION_FIXTURE,
        email: 'invalid',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchSchema(ERROR_SCHEMA)
      expect(response.body.error.reasons).toContain('email: Invalid email')
    })

    it('/register should return bad request if password do not match requirements', async () => {
      const response = await ENDPOINTS.register().send({
        ...REGISTRATION_FIXTURE,
        password: 'abc',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchSchema(ERROR_SCHEMA)
      expect(response.body.error.reasons).toContain('password: String must contain at least 4 character(s)')
      expect(response.body.error.reasons).toContain('password: Password must contain an uppercase and a number.')
    })

    it('/register should return bad request if name is empty', async () => {
      const response = await ENDPOINTS.register().send({
        ...REGISTRATION_FIXTURE,
        name: '',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchSchema(ERROR_SCHEMA)
      expect(response.body.error.reasons).toContain('name: String must contain at least 1 character(s)')
    })

    it('/register should returns token if body is valid', async () => {
      const response = await ENDPOINTS.register().send(REGISTRATION_FIXTURE)

      expect(response.status).toBe(200)
      expect(response.body).toMatchSchema({
        type: 'object',
        properties: {
          token: { type: 'string' },
          expiresAt: { type: 'string' },
        },
      })
    })

    it('/register should return bad request if email already exists', async () => {
      const response = await ENDPOINTS.register().send(REGISTRATION_FIXTURE)

      expect(response.status).toBe(400)
      expect(response.body).toMatchSchema(ERROR_SCHEMA)
      expect(response.body.error.reasons).toContain('Registration failed.')
    })

    it('/login with correct password should returns token', async () => {
      const response = await ENDPOINTS.login().send(LOGIN_FIXTURE)

      expect(response.status).toBe(200)
      expect(response.body).toMatchSchema({
        type: 'object',
        properties: {
          token: { type: 'string' },
          expiresAt: { type: 'string' },
        },
      })
    })

    it('/login with incorrect password should returns unauthorized', async () => {
      const response = await ENDPOINTS.login().send({ ...LOGIN_FIXTURE, password: 'test' })

      expect(response.status).toBe(401)
      expect(response.body).toMatchSchema(ERROR_SCHEMA)
    })

    it('/login with correct password should returns token', async () => {
      const response = await ENDPOINTS.login().send(LOGIN_FIXTURE)

      expect(response.status).toBe(200)
      expect(response.body).toMatchSchema({
        type: 'object',
        properties: {
          token: { type: 'string' },
          expiresAt: { type: 'string' },
        },
      })
    })
  })

  afterAll(async () => {
    server.close()
    await userRepository.removeByEmail(LOGIN_FIXTURE.email)
  })
})
