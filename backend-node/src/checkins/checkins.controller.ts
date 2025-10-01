import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CheckinsService } from './checkins.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('checkins')
@UseGuards(JwtAuthGuard, RolesGuard) // todas as rotas exigem autenticação + RBAC
export class CheckinsController {
    constructor(private readonly checkinsService: CheckinsService) { }

    @Post(':workorderId')
    @Roles('admin', 'agent') // apenas admin e agent podem fazer check-in
    create(
        @Param('workorderId') workorderId: string,
        @Body('note') note: string,
        @Request() req: any,
    ) {
        return this.checkinsService.create(Number(workorderId), req.user, note);
    }

    @Get('workorder/:workorderId')
    @Roles('admin', 'agent', 'viewer') // todos podem ver check-ins de uma ordem
    findByWorkorder(@Param('workorderId') workorderId: string) {
        return this.checkinsService.findByWorkorder(Number(workorderId));
    }

    @Get()
    @Roles('admin') // só admin pode ver todos os check-ins
    findAll() {
        return this.checkinsService.findAll();
    }
}
