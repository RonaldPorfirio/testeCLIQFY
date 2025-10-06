import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { AuthenticatedUser } from '@modules/auth/domain/entities/user.entity'
import type { TokenService } from '@modules/auth/application/services/token.service'

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(user: AuthenticatedUser): string {
    return this.jwtService.sign(this.buildPayload(user), { expiresIn: '15m' })
  }

  generateRefreshToken(user: AuthenticatedUser): string {
    return this.jwtService.sign(this.buildPayload(user), { expiresIn: '7d' })
  }

  private buildPayload(user: AuthenticatedUser) {
    return {
      sub: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  }
}
