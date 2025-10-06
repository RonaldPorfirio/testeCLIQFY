import { Injectable, NotFoundException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import {
  Prisma,
  TimelineEventType,
  Workorder as PrismaWorkorder,
  WorkorderPriority as PrismaWorkorderPriority,
  WorkorderStatus as PrismaWorkorderStatus,
} from '@prisma/client';

import { PrismaService } from '../../../../prisma/prisma.service';
import { LogHelper } from '@shared/logging/logger.helper';
import type { WorkorderPriority, WorkorderStatus } from '@modules/workorders/domain/entities/workorder.entity';
import { TimelineEvent } from '@modules/workorders/domain/entities/timeline-event.entity';

interface RequestUser {
  userId: number | null;
  username?: string;
  name?: string;
}

interface FindAllOptions {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface WorkorderResponse {
  id: string;
  title: string;
  description: string;
  status: WorkorderStatus;
  priority: WorkorderPriority;
  clientName: string;
  clientEmail: string;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

@Injectable()
export class WorkordersService {
  private readonly log: LogHelper;

  constructor(private readonly prisma: PrismaService, private readonly logger: PinoLogger) {
    this.log = new LogHelper(logger, WorkordersService.name);
  }

  async findAll(options: FindAllOptions, user: any) {
    const userCtx = this.toUserContext(user);
    const where: Prisma.WorkorderWhereInput = {};

    if (options.status) {
      where.status = options.status as PrismaWorkorderStatus;
    }

    if (options.priority) {
      where.priority = options.priority as PrismaWorkorderPriority;
    }

    if (options.search) {
      const search = options.search.toLowerCase();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } },
        { clientEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.workorder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.workorder.count({ where }),
    ]);

    this.log.info(userCtx.userId, 'LIST_WORKORDERS', {
      page,
      limit,
      total,
      status: options.status,
      priority: options.priority,
    });

    return {
      orders: orders.map((order) => this.serializeOrder(order)),
      total,
    };
  }

  async findOne(id: number, user: any): Promise<WorkorderResponse> {
    const userCtx = this.toUserContext(user);
    const order = await this.prisma.workorder.findUnique({ where: { id } });

    if (!order) {
      this.log.warn(userCtx.userId, 'FIND_WORKORDER_FAIL', { orderId: id });
      throw new NotFoundException('Workorder nao encontrada');
    }

    this.log.info(userCtx.userId, 'FIND_WORKORDER_SUCCESS', { orderId: id });
    return this.serializeOrder(order);
  }

  async create(
    data: {
      title: string;
      description: string;
      priority: WorkorderPriority;
      clientName: string;
      clientEmail: string;
      assignedTo?: string;
      status?: WorkorderStatus;
    },
    user: any,
  ): Promise<WorkorderResponse> {
    const userCtx = this.toUserContext(user);
    const status = (data.status ?? 'pending') as PrismaWorkorderStatus;
    const priority = data.priority as PrismaWorkorderPriority;

    const created = await this.prisma.$transaction(async (tx) => {
      const workorder = await tx.workorder.create({
        data: {
          title: data.title,
          description: data.description,
          priority,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          assignedTo: data.assignedTo ?? null,
          status,
          completedAt: status === 'completed' ? new Date() : null,
        },
      });

      await this.createTimelineEvent(tx, workorder.id, {
        type: TimelineEventType.created,
        description: 'Ordem de servico criada',
        userId: userCtx.userId,
        userName: userCtx.name ?? userCtx.username ?? null,
        metadata: { status: workorder.status },
      });

      if (workorder.assignedTo) {
        await this.createTimelineEvent(tx, workorder.id, {
          type: TimelineEventType.assigned,
          description: `Ordem atribuida para ${workorder.assignedTo}`,
          userId: userCtx.userId,
          userName: userCtx.name ?? userCtx.username ?? null,
        });
      }

      if (workorder.status !== 'pending') {
        await this.createTimelineEvent(tx, workorder.id, {
          type: TimelineEventType.status_change,
          description: `Status alterado para ${workorder.status}`,
          userId: userCtx.userId,
          userName: userCtx.name ?? userCtx.username ?? null,
          metadata: { status: workorder.status },
        });
      }

      return workorder;
    });

    this.log.info(userCtx.userId, 'CREATE_WORKORDER_SUCCESS', { orderId: created.id });
    return this.serializeOrder(created);
  }

  async update(id: number, data: Record<string, any>, user: any): Promise<WorkorderResponse> {
    const userCtx = this.toUserContext(user);

    const existing = await this.prisma.workorder.findUnique({ where: { id } });
    if (!existing) {
      this.log.warn(userCtx.userId, 'UPDATE_WORKORDER_FAIL', { orderId: id });
      throw new NotFoundException('Workorder nao encontrada');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.workorder.update({
        where: { id },
        data: {
          title: data.title ?? existing.title,
          description: data.description ?? existing.description,
          priority: (data.priority ?? existing.priority) as PrismaWorkorderPriority,
          clientName: data.clientName ?? existing.clientName,
          clientEmail: data.clientEmail ?? existing.clientEmail,
          assignedTo: data.assignedTo ?? existing.assignedTo,
          status: (data.status ?? existing.status) as PrismaWorkorderStatus,
          completedAt:
            data.status === 'completed'
              ? data.completedAt instanceof Date
                ? data.completedAt
                : new Date()
              : data.status
              ? null
              : existing.completedAt,
        },
      });

      if (data.status && data.status !== existing.status) {
        await this.createTimelineEvent(tx, id, {
          type: TimelineEventType.status_change,
          description: `Status alterado para ${updatedOrder.status}`,
          userId: userCtx.userId,
          userName: userCtx.name ?? userCtx.username ?? null,
          metadata: { from: existing.status, to: updatedOrder.status },
        });
      }

      if (data.assignedTo && data.assignedTo !== existing.assignedTo) {
        await this.createTimelineEvent(tx, id, {
          type: TimelineEventType.assigned,
          description: `Ordem atribuida para ${data.assignedTo}`,
          userId: userCtx.userId,
          userName: userCtx.name ?? userCtx.username ?? null,
          metadata: { from: existing.assignedTo, to: data.assignedTo },
        });
      }

      return updatedOrder;
    });

    this.log.info(userCtx.userId, 'UPDATE_WORKORDER_SUCCESS', {
      orderId: id,
      fields: Object.keys(data),
    });

    return this.serializeOrder(updated);
  }

  async remove(id: number, user: any) {
    const userCtx = this.toUserContext(user);

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.workorder.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('Workorder nao encontrada');
      }
      await tx.workorder.delete({ where: { id } });
    });

    this.log.info(userCtx.userId, 'REMOVE_WORKORDER_SUCCESS', { orderId: id });

    return { message: 'Workorder removida com sucesso' };
  }

  async addComment(orderId: number, note: string, user: any) {
    const userCtx = this.toUserContext(user);

    await this.ensureOrderExists(orderId);

    await this.prisma.timelineEvent.create({
      data: {
        orderId,
        type: TimelineEventType.comment,
        description: note,
        userId: userCtx.userId,
        userName: userCtx.name ?? userCtx.username ?? null,
      },
    });
  }

  async getTimeline(orderId: number, user: any): Promise<Array<Omit<TimelineEvent, 'timestamp'> & { timestamp: string }>> {
    const userCtx = this.toUserContext(user);

    await this.ensureOrderExists(orderId);

    const events = await this.prisma.timelineEvent.findMany({
      where: { orderId },
      orderBy: { timestamp: 'asc' },
    });

    this.log.info(userCtx.userId, 'LIST_TIMELINE', { orderId, totalEvents: events.length });

    return events.map((event) => ({
      id: event.id,
      orderId: event.orderId,
      type: event.type,
      description: event.description,
      userId: event.userId,
      userName: event.userName,
      metadata: (event.metadata as Record<string, any>) ?? undefined,
      timestamp: event.timestamp.toISOString(),
    }));
  }

  private async ensureOrderExists(orderId: number) {
    const exists = await this.prisma.workorder.findUnique({ where: { id: orderId } });
    if (!exists) {
      throw new NotFoundException('Workorder nao encontrada');
    }
  }

  private async createTimelineEvent(
    tx: Prisma.TransactionClient,
    orderId: number,
    data: {
      type: TimelineEventType;
      description: string;
      userId: number | null;
      userName: string | null;
      metadata?: Record<string, any>;
    },
  ) {
    await tx.timelineEvent.create({
      data: {
        orderId,
        type: data.type,
        description: data.description,
        userId: data.userId ?? null,
        userName: data.userName ?? null,
        metadata: data.metadata ?? undefined,
      },
    });
  }

  private serializeOrder(order: PrismaWorkorder): WorkorderResponse {
    return {
      id: order.id.toString(),
      title: order.title,
      description: order.description,
      status: order.status as WorkorderStatus,
      priority: order.priority as WorkorderPriority,
      clientName: order.clientName,
      clientEmail: order.clientEmail,
      assignedTo: order.assignedTo ?? null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completedAt: order.completedAt ? order.completedAt.toISOString() : null,
    };
  }

  private toUserContext(user: any): RequestUser {
    if (!user) {
      return { userId: null };
    }

    return {
      userId: user.userId,
      username: user.username,
      name: user.name,
    };
  }
}