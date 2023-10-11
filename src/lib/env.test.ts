import getEnvVariable from './env'

describe('getEnvVariable', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  it('should return the value of the PORT environment variable', () => {
    process.env.PORT = '3000'
    expect(getEnvVariable('PORT')).toBe('3000')
  })

  it('should return the value of the JWT_SECRET environment variable', () => {
    process.env.JWT_SECRET = 'my-secret'
    expect(getEnvVariable('JWT_SECRET')).toBe('my-secret')
  })

  it('should throw an error if the PORT environment variable is not set', () => {
    delete process.env.PORT
    expect(() => getEnvVariable('PORT')).toThrowError('Missing "PORT" env variable.')
  })

  it('should throw an error if the JWT_SECRET environment variable is not set', () => {
    delete process.env.JWT_SECRET
    expect(() => getEnvVariable('JWT_SECRET')).toThrowError('Missing "JWT_SECRET" env variable.')
  })

  afterAll(() => {
    process.env = OLD_ENV
  })
})
