/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: './src/test/global-setup.ts',
  globalTeardown: './src/test/global-teardown.ts',
}
