import bcrypt from 'bcrypt'

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, await bcrypt.genSalt())
}

export async function compareHashedPassword(plain: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(plain, hashed)
}
