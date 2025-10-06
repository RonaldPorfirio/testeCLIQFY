export interface PasswordHasher {
  compare(plain: string, hashed: string): Promise<boolean>
}

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER')
