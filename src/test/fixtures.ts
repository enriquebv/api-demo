export const CUSTOMER_LOGIN_FIXTURE = {
  email: 'test@test.test',
  password: 'Test1',
}

export const CUSTOMER_REGISTRATION_FIXTURE = {
  name: 'test',
  ...CUSTOMER_LOGIN_FIXTURE,
}

export const ADMIN_FIXTURE = {
  name: 'Admin',
  email: 'admin@admin.admin',
  password: 'Admin1',
}
