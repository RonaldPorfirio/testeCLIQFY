import type { AuthenticatedUser } from '@modules/auth/domain/entities/user.entity'

export interface TokenService {
  generateAccessToken(user: AuthenticatedUser): string
  generateRefreshToken(user: AuthenticatedUser): string
}

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE')

