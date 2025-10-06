import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { LoginUseCase } from '../../application/use-cases/login.use-case'
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case'
import { GetAuthenticatedUserUseCase } from '../../application/use-cases/get-authenticated-user.use-case'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { RefreshAuthGuard } from '../guards/refresh-auth.guard'

describe('AuthController', () => {
  let controller: AuthController

  const loginUseCaseMock = { execute: jest.fn() }
  const refreshUseCaseMock = { execute: jest.fn() }
  const getUserUseCaseMock = { execute: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: LoginUseCase, useValue: loginUseCaseMock },
        { provide: RefreshTokenUseCase, useValue: refreshUseCaseMock },
        { provide: GetAuthenticatedUserUseCase, useValue: getUserUseCaseMock },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
        { provide: RefreshAuthGuard, useValue: { canActivate: () => true } },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
