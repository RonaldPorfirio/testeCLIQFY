import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CheckinsService } from '@modules/checkins/application/services/checkins.service';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';
import { Roles } from '@modules/auth/presentation/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/presentation/guards/roles.guard';
import { CreateCheckinDto } from '@modules/checkins/presentation/dto/create-checkin.dto';
import { CheckinDto } from '@modules/checkins/presentation/dto/checkin.dto';

@ApiTags('Check-ins')
@Controller('checkins')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Post(':workorderId')
  @Roles('admin', 'agent')
  @ApiOperation({ summary: 'Registra um novo check-in para a ordem informada' })
  @ApiBody({ type: CreateCheckinDto })
  @ApiOkResponse({ type: CheckinDto })
  create(
    @Param('workorderId') workorderId: string,
    @Body() body: CreateCheckinDto,
    @Request() req: any,
  ) {
    return this.checkinsService.create(Number(workorderId), req.user, body);
  }

  @Get('workorder/:workorderId')
  @Roles('admin', 'agent', 'viewer')
  @ApiOperation({ summary: 'Lista os check-ins de uma ordem específica' })
  @ApiOkResponse({ type: [CheckinDto] })
  findByWorkorder(@Param('workorderId') workorderId: string) {
    return this.checkinsService.findByWorkorder(Number(workorderId));
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Lista todos os check-ins cadastrados' })
  @ApiOkResponse({ type: [CheckinDto] })
  findAll() {
    return this.checkinsService.findAll();
  }
}
