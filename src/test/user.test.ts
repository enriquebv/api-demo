import request from 'supertest'
import { Application } from 'express'
import { type Server } from 'http'
import { matchers } from 'jest-json-schema'
import { API_ERROR_SCHEMA, API_TOKEN_SCHEMA } from './schemas'
import { CUSTOMER_LOGIN_FIXTURE, CUSTOMER_REGISTRATION_FIXTURE, ADMIN_FIXTURE, ADMIN_ID, CUSTOMER_ID } from './fixtures'
import { getUserToken, createTestServer, strictSchema, getUserIdByEmail } from './helpers'

expect.extend(matchers)

describe('/api/user', () => {
  let app: Application
  let server: Server
  let adminToken: string
  let customerToken: string

  beforeAll(async () => {
    const testServer = await createTestServer()
    app = testServer.app
    server = testServer.server
    customerToken = await getUserToken(CUSTOMER_ID)
    adminToken = await getUserToken(ADMIN_ID)
  })

  const fetchers = {
    async register(body: object) {
      return request(app).post('/api/user/register').send(body)
    },
    async login(body: object) {
      return request(app).post('/api/user/login').send(body)
    },
    async removeUser(id: string, token: string) {
      return request(app)
        .delete(`/api/user/${id}`)
        .set({ Authorization: `Bearer ${token}` })
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
    const response = await fetchers.register({ ...CUSTOMER_REGISTRATION_FIXTURE, email: 'customer2@test.test' })

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
    const response = await fetchers.removeUser('abc', adminToken)

    expect(response.status).toBe(400)
    expect(response.body).toMatchSchema(API_ERROR_SCHEMA)
    expect(response.body.error.reasons).toContain('id: Invalid uuid')
  })

  it('/user delete with valid id but not an admin, returns 403 error', async () => {
    const response = await fetchers.removeUser(await getUserIdByEmail('customer2@test.test'), customerToken)

    expect(response.status).toBe(403)
    expect(response.body).toMatchSchema(API_ERROR_SCHEMA)
    expect(response.body.error.reasons).toContain('Action only for admin users.')
  })

  it('/user delete with valid id returns validation error', async () => {
    const response = await fetchers.removeUser(await getUserIdByEmail('customer2@test.test'), adminToken)

    expect(response.status).toBe(200)
  })

  afterAll(async () => {
    server.close()
  })
})
