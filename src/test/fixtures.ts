export const CUSTOMER_ID = '00000000-0000-4000-8000-000000000000'
export const ADMIN_ID = '00000000-0000-4000-8000-000000000001'
export const CAR_ID = '00000000-0000-4000-8000-000000000002'

export const CUSTOMER_LOGIN_FIXTURE = {
  email: 'customer@test.test',
  password: 'Customer1',
}

export const CUSTOMER_REGISTRATION_FIXTURE = {
  name: 'Customer',
  ...CUSTOMER_LOGIN_FIXTURE,
}

export const ADMIN_FIXTURE = {
  name: 'Admin',
  email: 'admin@test.test',
  password: 'Admin1',
}
