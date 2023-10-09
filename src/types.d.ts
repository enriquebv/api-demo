import { UserEntity, UserRole } from './entities/user.entity'

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: UserEntity['id']
        role: UserRole
      }
    }
  }
}
