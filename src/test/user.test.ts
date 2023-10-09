import request from 'supertest'
import { Application } from 'express'
import { type Server } from 'http'
import { matchers } from 'jest-json-schema'
import { userRepository } from '../repositories'
import { API_ERROR_SCHEMA, API_TOKEN_SCHEMA } from './schemas'
import { CUSTOMER_LOGIN_FIXTURE, CUSTOMER_REGISTRATION_FIXTURE, ADMIN_FIXTURE } from './fixtures'
import { addUser, getAdminToken, createTestServer, strictSchema } from './helpers'

expect.extend(matchers)

describe('/api/user', () => {
  let app: Application
  let server: Server
  let adminToken: string

  beforeAll(async () => {
    const testServer = await createTestServer()
    app = testServer.app
    server = testServer.server

    const adminId = await addUser({
      ...ADMIN_FIXTURE,
      admin: true,
    })
    adminToken = await getAdminToken(adminId)
  })

  const fetchers = {
    async register(body: object) {
      return request(app).post('/api/user/register').send(body)
    },
    async login(body: object) {
      return request(app).post('/api/user/login').send(body)
    },
    async removeUser(id: string) {
      return request(app)
        .delete(`/api/user/${id}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send()
    },
  }

  it('/register should return bad request is body is empty', async () => {
    const response = await fetchers.register({})

    expect(response.status).toBe(400)
    expect(response.body).toMatchSchema(API_ERROR_SCHEMA)
    expect(response.body.error.reasons).toContain('name: Required')
    expect(response.body.error.reasons).toContain('email: Required')
    expect(response.body.error.reasons).toContain('password: Required')
  })

  it('/register should return bad request is email is not an email', async () => {
    const response = await fetchers.register({
      ...CUSTOMER_REGISTRATION_FIXTURE,
      email: 'invalid',
    })

    expect(response.status).toBe(400)
    expect(response.body).toMatchSchema(API_ERROR_SCHEMA)
    expect(response.body.error.reasons).toContain('email: Invalid email')
  })

  it('/register should return bad request if password do not match requirements', async () => {
    const response = await fetchers.register({
      ...CUSTOMER_REGISTRATION_FIXTURE,
      password: 'abc',
    })

    expect(response.status).toBe(400)
    expect(response.body).toMatchSchema(API_ERROR_SCHEMA)
    expect(response.body.error.reasons).toContain('password: String must contain at least 4 character(s)')
    expect(response.body.error.reasons).toContain('password: Password must contain an uppercase and a number.')
  })

  it('/register should return bad request if name is empty', async () => {
    const response = await fetchers.register({
      ...CUSTOMER_REGISTRATION_FIXTURE,
      name: '',
    })

    expect(response.status).toBe(400)
    expect(response.body).toMatchSchema(API_ERROR_SCHEMA)
    expect(response.body.error.reasons).toContain('name: String must contain at least 1 character(s)')
  })

  it('/register should returns token if body is valid', async () => {
    const response = await fetchers.register(CUSTOMER_REGISTRATION_FIXTURE)

    expect(response.status).toBe(200)
    expect(response.body).toMatchSchema(API_TOKEN_SCHEMA)
  })

  it('/register should return bad request if email already exists', async () => {
    const response = await fetchers.register(CUSTOMER_REGISTRATION_FIXTURE)

    expect(response.status).toBe(400)
    expect(response.body).toMatchSchema(API_ERROR_SCHEMA)
    expect(response.body.error.reasons).toContain('Registration failed.')
  })

  it('/login with correct password should returns token', async () => {
    const response = await fetchers.login(CUSTOMER_LOGIN_FIXTURE)

    expect(response.status).toBe(200)
    expect(response.body).toMatchSchema(API_TOKEN_SCHEMA)
  })

  it('/login with incorrect password should returns unauthorized', async () => {
    const response = await fetchers.login({ ...CUSTOMER_LOGIN_FIXTURE, password: 'test' })

    expect(response.status).toBe(401)
    expect(response.body).toMatchSchema(API_ERROR_SCHEMA)
    expect(response.body.error.reasons).toContain('Invalid password provided.')
  })

  it('/login with correct password should returns token', async () => {
    const response = await fetchers.login(CUSTOMER_LOGIN_FIXTURE)

    expect(response.status).toBe(200)
    expect(response.body).toMatchSchema(API_TOKEN_SCHEMA)
  })

  it('/user delete with invalid id returns validation error', async () => {
    const response = await fetchers.removeUser('10e')

    expect(response.status).toBe(400)
    expect(response.body).toMatchSchema(API_ERROR_SCHEMA)
    expect(response.body.error.reasons).toContain('id: Expected number, received nan')
  })

  it('/user delete with valid id returns validation error', async () => {
    const idToRemove = await addUser({ name: 'TempUser', email: 'temp.user@test.test', password: 'tempuser' })
    const response = await fetchers.removeUser(String(idToRemove))

    expect(response.status).toBe(200)
  })

  afterAll(async () => {
    server.close()
    await Promise.all([
      userRepository.removeByEmail(CUSTOMER_LOGIN_FIXTURE.email),
      userRepository.removeByEmail(ADMIN_FIXTURE.email),
    ])
  })
})
