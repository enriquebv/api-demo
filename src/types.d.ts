import { UserRole } from './entities/user.entity'

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: number
        role: UserRole
      }
    }
  }
}
