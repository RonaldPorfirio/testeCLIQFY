import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import type { PasswordHasher } from '@modules/auth/domain/services/password-hasher'

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  }
}
