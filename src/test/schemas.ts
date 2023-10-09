export const API_ERROR_SCHEMA = {
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
