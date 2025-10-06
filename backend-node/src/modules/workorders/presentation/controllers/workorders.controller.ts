import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { WorkordersService } from '@modules/workorders/application/services/workorders.service';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/presentation/guards/roles.guard';
import { Roles } from '@modules/auth/presentation/decorators/roles.decorator';
import { CreateWorkorderDto } from '@modules/workorders/presentation/dto/create-workorder.dto';
import { WorkorderDto } from '@modules/workorders/presentation/dto/workorder.dto';
import { WorkorderListDto } from '@modules/workorders/presentation/dto/workorder-list.dto';
import { UpdateWorkorderDto } from '@modules/workorders/presentation/dto/update-workorder.dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WorkordersController {
  constructor(private readonly workordersService: WorkordersService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Cria uma nova ordem de serviço' })
  @ApiBody({ type: CreateWorkorderDto })
  @ApiOkResponse({ type: WorkorderDto })
  create(@Body() body: CreateWorkorderDto, @Request() req: any) {
    return this.workordersService.create(body, req.user);
  }

  @Get()
  @Roles('admin', 'agent', 'viewer')
  @ApiOperation({ summary: 'Lista ordens de serviço com filtros e paginação' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtra pelo status da ordem' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filtra pela prioridade da ordem' })
  @ApiQuery({ name: 'search', required: false, description: 'Busca por título, cliente ou email' })
  @ApiQuery({ name: 'page', required: false, description: 'Página da paginação', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Quantidade de itens por página', type: Number })
  @ApiOkResponse({ type: WorkorderListDto })
  findAll(
    @Query('status') status: string,
    @Query('priority') priority: string,
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Request() req: any,
  ) {
    return this.workordersService.findAll(
      {
        status,
        priority,
        search,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      },
      req.user,
    );
  }

  @Get(':id')
  @Roles('admin', 'agent', 'viewer')
  @ApiOperation({ summary: 'Recupera detalhes de uma ordem de serviço' })
  @ApiOkResponse({ type: WorkorderDto })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.workordersService.findOne(Number(id), req.user);
  }

  @Put(':id')
  @Roles('admin', 'agent')
  @ApiOperation({ summary: 'Atualiza dados de uma ordem de serviço' })
  @ApiBody({ type: UpdateWorkorderDto })
  @ApiOkResponse({ type: WorkorderDto })
  update(@Param('id') id: string, @Body() body: UpdateWorkorderDto, @Request() req: any) {
    return this.workordersService.update(Number(id), body, req.user);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remove uma ordem de serviço' })
  @ApiOkResponse({ schema: { example: { message: 'Workorder removida com sucesso' } } })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.workordersService.remove(Number(id), req.user);
  }
}
