import request from 'supertest'
import { Application } from 'express'
import { type Server } from 'http'
import { createServer } from './server'
import { matchersWithOptions } from 'jest-json-schema'
import { userRepository } from './repositories'
import { hashPassword } from './lib/password'
import { UserRole } from './entities/user.entity'

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

  async function addUser(options: { name: string; email: string; password: string; admin?: boolean }): Promise<number> {
    const { id } = await userRepository.create({
      name: options.name,
      email: options.email,
      password: await hashPassword(options.password),
    })

    if (options.admin === true) {
      await userRepository.setRole(id, UserRole.ADMIN)
    }

    return id
  }

  async function getAdminToken() {
    const response = await request(app).post('/api/user/login').send({
      email: 'admin@admin.admin',
      password: 'Admin1',
    })

    return response.body.token
  }

  beforeAll(async () => {
    async function setupServer() {
      app = createServer()

      return new Promise((resolve) => {
        server = app.listen(HTTP_TEST_PORT, () => resolve(undefined))
      })
    }

    await addUser({
      name: 'Admin',
      email: 'admin@admin.admin',
      password: 'Admin1',
      admin: true,
    })
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
      removeUser(id: string) {
        return request(app).delete(`/api/user/${id}`)
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
      expect(response.body.error.reasons).toContain('Invalid password provided.')
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

    it('/user delete with invalid id returns validation error', async () => {
      const response = await ENDPOINTS.removeUser('10e')
        .set({ Authorization: `Bearer ${await getAdminToken()}` })
        .send()

      expect(response.status).toBe(400)
      expect(response.body).toMatchSchema(ERROR_SCHEMA)
      expect(response.body.error.reasons).toContain('id: Expected number, received nan')
    })

    it('/user delete with valid id returns validation error', async () => {
      const idToRemove = await addUser({ name: 'TempUser', email: 'temp.user@test.test', password: 'tempuser' })
      const response = await ENDPOINTS.removeUser(String(idToRemove))
        .set({ Authorization: `Bearer ${await getAdminToken()}` })
        .send()

      expect(response.status).toBe(200)
    })
  })

  it('request with required token but without authorization headers should return a unauthorized error', async () => {
    const response = await request(app).delete('/api/user/1000')

    expect(response.status).toBe(401)
    expect(response.body.error.reasons).toContain('Missing header "Authorization" with token.')
  })

  afterAll(async () => {
    server.close()
    await userRepository.removeByEmail(LOGIN_FIXTURE.email)
    await userRepository.removeByEmail('admin@admin.admin')
  })
})
