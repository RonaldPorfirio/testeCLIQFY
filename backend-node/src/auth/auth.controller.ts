import { Controller, Post, Body, UseGuards, Request, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RefreshAuthGuard } from './refresh-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) throw new UnauthorizedException('Credenciais inválidas');
        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Request() req: any) {
        const user = this.authService.getUserById(req.user.userId);
        return { user };
    }

    @UseGuards(RefreshAuthGuard)
    @Post('refresh')
    async refresh(@Request() req: any) {
        const result = await this.authService.refresh(req.user);
        if (!result) {
            throw new UnauthorizedException('Refresh token inválido');
        }
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('admin-only')
    adminOnly() {
        return { message: 'Acesso liberado somente para ADMIN' };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('agent')
    @Get('agent-only')
    agentOnly() {
        return { message: 'Acesso liberado somente para AGENT' };
    }
}
