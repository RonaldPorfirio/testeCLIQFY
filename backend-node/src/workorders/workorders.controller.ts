import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { WorkordersService } from './workorders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { WorkorderPriority, WorkorderStatus } from './workorder.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkordersController {
    constructor(private readonly workordersService: WorkordersService) { }

    @Post()
    @Roles('admin')
    create(
        @Body()
        body: {
            title: string;
            description: string;
            priority: WorkorderPriority;
            clientName: string;
            clientEmail: string;
            assignedTo?: string;
            status?: WorkorderStatus;
        },
        @Request() req: any,
    ) {
        return this.workordersService.create(body, req.user);
    }

    @Get()
    @Roles('admin', 'agent', 'viewer')
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
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.workordersService.findOne(Number(id), req.user);
    }

    @Put(':id')
    @Roles('admin', 'agent')
    update(@Param('id') id: string, @Body() body: Partial<{ [key: string]: any }>, @Request() req: any) {
        return this.workordersService.update(Number(id), body, req.user);
    }

    @Delete(':id')
    @Roles('admin')
    remove(@Param('id') id: string, @Request() req: any) {
        return this.workordersService.remove(Number(id), req.user);
    }
}
