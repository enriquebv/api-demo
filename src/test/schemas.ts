import { strictSchema } from './helpers'

export const API_ERROR_SCHEMA = strictSchema({
  type: 'object',
  properties: {
    error: strictSchema({
      type: 'object',
      properties: {
        code: { type: 'string' },
        reasons: { type: 'array', items: { type: 'string' } },
      },
    }),
  },
})

export const API_TOKEN_SCHEMA = strictSchema({
  type: 'object',
  properties: {
    token: { type: 'string' },
    expiresAt: { type: 'string' },
  },
})
