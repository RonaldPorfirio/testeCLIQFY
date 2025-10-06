import { Injectable } from '@nestjs/common'
import type { PasswordHasher } from '@modules/auth/domain/services/password-hasher'

@Injectable()
export class SimplePasswordHasher implements PasswordHasher {
  async compare(plain: string, hashed: string): Promise<boolean> {
    return plain === hashed
  }
}
