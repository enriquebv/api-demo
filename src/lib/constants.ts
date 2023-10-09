// Note: Reference https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
export enum PrismaErrorCodes {
  UNIQUE = 'P2002',
  RECORD_NOT_EXIST = 'P2025',
}

export const EXPIRED_TOKEN_ERROR_MESSAGE = 'Token provided is not longer valid.'
