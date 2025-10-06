import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { LoginUseCase, LoginCommand } from '@modules/auth/application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '@modules/auth/application/use-cases/refresh-token.use-case';
import { GetAuthenticatedUserUseCase } from '@modules/auth/application/use-cases/get-authenticated-user.use-case';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';
import { RefreshAuthGuard } from '@modules/auth/presentation/guards/refresh-auth.guard';
import { Roles } from '@modules/auth/presentation/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/presentation/guards/roles.guard';
import { LoginRequestDto } from '@modules/auth/presentation/dto/login-request.dto';
import { LoginResponseDto } from '@modules/auth/presentation/dto/login-response.dto';
import { RefreshTokenResponseDto } from '@modules/auth/presentation/dto/refresh-token-response.dto';
import { ProfileResponseDto } from '@modules/auth/presentation/dto/profile-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly getAuthenticatedUserUseCase: GetAuthenticatedUserUseCase,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Autentica o usuário e retorna tokens JWT' })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas' })
  async login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
    const command: LoginCommand = {
      login: body.email ?? body.login ?? '',
      password: body.password,
    };

    return this.loginUseCase.execute(command);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Gera um novo token de acesso a partir do refresh token' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: RefreshTokenResponseDto })
  @ApiUnauthorizedResponse({ description: 'Refresh token inválido ou expirado' })
  async refresh(@Request() req: any): Promise<RefreshTokenResponseDto> {
    return this.refreshTokenUseCase.execute(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ProfileResponseDto })
  async getProfile(@Request() req: any): Promise<ProfileResponseDto> {
    const user = await this.getAuthenticatedUserUseCase.execute(req.user.userId);
    return { user };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-only')
  @ApiOperation({ summary: 'Endpoint protegido para administradores' })
  @ApiBearerAuth()
  @ApiOkResponse({ schema: { example: { message: 'Acesso liberado somente para ADMIN' } } })
  adminOnly() {
    return { message: 'Acesso liberado somente para ADMIN' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent')
  @Get('agent-only')
  @ApiOperation({ summary: 'Endpoint protegido para agentes' })
  @ApiBearerAuth()
  @ApiOkResponse({ schema: { example: { message: 'Acesso liberado somente para AGENT' } } })
  agentOnly() {
    return { message: 'Acesso liberado somente para AGENT' };
  }
}

