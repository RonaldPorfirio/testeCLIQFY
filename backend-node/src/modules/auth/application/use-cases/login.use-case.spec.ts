import { Test } from '@nestjs/testing'
import { JwtModule } from '@nestjs/jwt'
import { LoginUseCase } from './login.use-case'
import { USER_REPOSITORY } from '@modules/auth/domain/repositories/user.repository'
import { PASSWORD_HASHER } from '@modules/auth/domain/services/password-hasher'
import { TOKEN_SERVICE } from '@modules/auth/application/services/token.service'
import { InMemoryUserRepository } from '@modules/auth/infrastructure/persistence/in-memory-user.repository'
import { SimplePasswordHasher } from '@modules/auth/infrastructure/security/simple-password.hasher'
import { JwtTokenService } from '@modules/auth/infrastructure/security/jwt-token.service'

describe('LoginUseCase', () => {
  it('returns tokens for valid credentials', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'minha_chave_super_secreta',
        }),
      ],
      providers: [
        LoginUseCase,
        { provide: USER_REPOSITORY, useClass: InMemoryUserRepository },
        { provide: PASSWORD_HASHER, useClass: SimplePasswordHasher },
        { provide: TOKEN_SERVICE, useClass: JwtTokenService },
      ],
    }).compile()

    const useCase = moduleRef.get(LoginUseCase)
    const result = await useCase.execute({ login: 'admin@example.com', password: 'admin123' })

    expect(result.user.email).toBe('admin@example.com')
    expect(result.token).toBeDefined()
    expect(result.refreshToken).toBeDefined()
  })
})


