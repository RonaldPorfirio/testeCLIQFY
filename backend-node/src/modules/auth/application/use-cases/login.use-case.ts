import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import type { AuthenticatedUser } from '@modules/auth/domain/entities/user.entity'
import { USER_REPOSITORY, type UserRepository } from '@modules/auth/domain/repositories/user.repository'
import { PASSWORD_HASHER, type PasswordHasher } from '@modules/auth/domain/services/password-hasher'
import { TOKEN_SERVICE, type TokenService } from '@modules/auth/application/services/token.service'

// 👇 export aqui
export interface LoginCommand {
  login: string
  password: string
}

// 👇 export aqui
export interface LoginResult {
  user: AuthenticatedUser
  token: string
  refreshToken: string
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
  ) { }

  async execute({ login, password }: LoginCommand): Promise<LoginResult> {
    const normalizedLogin = login?.toLowerCase() ?? ''
    const user = await this.users.findByLogin(normalizedLogin)

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    const isValid = await this.hasher.compare(password, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    const sanitized = user.toAuthenticated()

    return {
      user: sanitized,
      token: this.tokenService.generateAccessToken(sanitized),
      refreshToken: this.tokenService.generateRefreshToken(sanitized),
    }
  }
}
