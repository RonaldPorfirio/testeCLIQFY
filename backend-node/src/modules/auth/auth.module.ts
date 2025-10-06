import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../prisma/prisma.module';
import { LoginUseCase } from '@modules/auth/application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '@modules/auth/application/use-cases/refresh-token.use-case';
import { GetAuthenticatedUserUseCase } from '@modules/auth/application/use-cases/get-authenticated-user.use-case';
import { AuthController } from '@modules/auth/presentation/controllers/auth.controller';
import { JwtStrategy } from '@modules/auth/infrastructure/security/strategies/jwt.strategy';
import { RefreshStrategy } from '@modules/auth/infrastructure/security/strategies/refresh.strategy';
import { RolesGuard } from '@modules/auth/presentation/guards/roles.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';
import { RefreshAuthGuard } from '@modules/auth/presentation/guards/refresh-auth.guard';
import { PrismaUserRepository } from '@modules/auth/infrastructure/persistence/prisma-user.repository';
import { USER_REPOSITORY } from '@modules/auth/domain/repositories/user.repository';
import { BcryptPasswordHasher } from '@modules/auth/infrastructure/security/bcrypt-password.hasher';
import { PASSWORD_HASHER } from '@modules/auth/domain/services/password-hasher';
import { JwtTokenService } from '@modules/auth/infrastructure/security/jwt-token.service';
import { TOKEN_SERVICE } from '@modules/auth/application/services/token.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'minha_chave_super_secreta',
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    LoginUseCase,
    RefreshTokenUseCase,
    GetAuthenticatedUserUseCase,
    JwtStrategy,
    RefreshStrategy,
    RolesGuard,
    JwtAuthGuard,
    RefreshAuthGuard,
  ],
  exports: [
    LoginUseCase,
    RefreshTokenUseCase,
    GetAuthenticatedUserUseCase,
    JwtAuthGuard,
    RefreshAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
