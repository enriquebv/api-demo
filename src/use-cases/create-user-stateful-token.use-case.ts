import { UserEntity } from '../entities/user.entity'
import { buildToken } from '../lib/token'

export default async function createUserStatefulTokenUseCase(
  userId: UserEntity['id']
): Promise<{ token: string; expiresAt: Date }> {
  return await buildToken({ id: userId })
}
