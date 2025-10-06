import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import type { AuthenticatedUser } from '@modules/auth/domain/entities/user.entity'
import { USER_REPOSITORY, type UserRepository } from '@modules/auth/domain/repositories/user.repository'
import { TOKEN_SERVICE, type TokenService } from '@modules/auth/application/services/token.service'

interface RefreshTokenCommand {
  userId: number
}

interface RefreshTokenResult {
  user: AuthenticatedUser
  token: string
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
  ) {}

  async execute({ userId }: RefreshTokenCommand): Promise<RefreshTokenResult> {
    const user = await this.users.findById(userId)
    if (!user) {
      throw new UnauthorizedException('Refresh token inválido')
    }

    const authenticated = user.toAuthenticated()

    return {
      user: authenticated,
      token: this.tokenService.generateAccessToken(authenticated),
    }
  }
}

