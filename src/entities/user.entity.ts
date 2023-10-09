export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export interface UserEntity {
  id: number
  name: string
  email: string
  password: string
  role: UserRole
}

export type UserToCreateEntity = Pick<UserEntity, 'name' | 'email' | 'password'>
