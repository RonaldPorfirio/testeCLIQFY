import { Injectable, NotFoundException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { LogHelper } from '../common/logger.helper';
import { Workorder, WorkorderPriority, WorkorderStatus } from './workorder.entity';

interface RequestUser {
    userId: number | null;
    username?: string;
    name?: string;
}

export interface TimelineEvent {
    id: number;
    orderId: number;
    type: 'created' | 'status_change' | 'assigned' | 'comment';
    description: string;
    userId: number | null;
    userName: string | null;
    timestamp: Date;
    metadata?: Record<string, any>;
}

interface FindAllOptions {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface WorkorderResponse
    extends Omit<Workorder, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'> {
    id: string;
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
}

@Injectable()
export class WorkordersService {
    private workorders: Workorder[] = [];
    private nextId = 1;
    private timelineId = 1;
    private timelines: Map<number, TimelineEvent[]> = new Map();
    private log: LogHelper;

    constructor(private readonly logger: PinoLogger) {
        this.log = new LogHelper(logger, WorkordersService.name);
        this.seedData();
    }

    private seedData() {
        if (this.workorders.length > 0) {
            return;
        }

        const seedOrders: Workorder[] = [
            {
                id: 1,
                title: 'Instalação de Sistema de Ar Condicionado',
                description: 'Instalação completa de sistema split em escritório comercial',
                status: 'in_progress',
                priority: 'high',
                clientName: 'Empresa ABC Ltda',
                clientEmail: 'contato@empresaabc.com',
                assignedTo: 'João Silva',
                createdAt: new Date('2025-01-15T10:00:00Z'),
                updatedAt: new Date('2025-01-16T14:30:00Z'),
                completedAt: null,
            },
            {
                id: 2,
                title: 'Manutenção Preventiva - Sistema Elétrico',
                description: 'Verificação e manutenção do sistema elétrico predial',
                status: 'pending',
                priority: 'medium',
                clientName: 'Condomínio Residencial XYZ',
                clientEmail: 'sindico@condominioxyz.com',
                assignedTo: undefined,
                createdAt: new Date('2025-01-16T09:00:00Z'),
                updatedAt: new Date('2025-01-16T09:00:00Z'),
                completedAt: null,
            },
            {
                id: 3,
                title: 'Reparo de Vazamento Hidráulico',
                description: 'Correção de vazamento em tubulação principal',
                status: 'completed',
                priority: 'urgent',
                clientName: 'Maria Santos',
                clientEmail: 'maria.santos@email.com',
                assignedTo: 'Pedro Costa',
                createdAt: new Date('2025-01-14T08:00:00Z'),
                updatedAt: new Date('2025-01-15T16:00:00Z'),
                completedAt: new Date('2025-01-15T16:00:00Z'),
            },
        ];

        this.workorders = seedOrders;
        this.nextId = seedOrders.length + 1;

        seedOrders.forEach((order) => {
            this.timelines.set(order.id, []);
            this.addTimelineEvent(order.id, {
                type: 'created',
                description: 'Ordem de serviço criada',
                userId: null,
                userName: null,
                metadata: { status: order.status },
            });

            if (order.assignedTo) {
                this.addTimelineEvent(order.id, {
                    type: 'assigned',
                    description: `Ordem atribuída para ${order.assignedTo}`,
                    userId: null,
                    userName: null,
                });
            }

            if (order.status !== 'pending') {
                this.addTimelineEvent(order.id, {
                    type: 'status_change',
                    description: `Status alterado para ${order.status}`,
                    userId: null,
                    userName: null,
                    metadata: { status: order.status },
                });
            }
        });
    }

    private ensureTimeline(orderId: number) {
        if (!this.timelines.has(orderId)) {
            this.timelines.set(orderId, []);
        }
    }

    private addTimelineEvent(
        orderId: number,
        event: Omit<TimelineEvent, 'id' | 'orderId' | 'timestamp'> & { timestamp?: Date },
    ) {
        this.ensureTimeline(orderId);
        const events = this.timelines.get(orderId)!;
        events.push({
            id: this.timelineId++,
            orderId,
            timestamp: event.timestamp ?? new Date(),
            ...event,
        });
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

    private getEntityOrFail(id: number): Workorder {
        const order = this.workorders.find((o) => o.id === id);
        if (!order) {
            throw new NotFoundException('Workorder não encontrada');
        }
        return order;
    }

    private serializeOrder(order: Workorder) {
        return {
            ...order,
            id: order.id.toString(),
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
            completedAt: order.completedAt ? order.completedAt.toISOString() : null,
        };
    }

    create(
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
    ): WorkorderResponse {
        const userCtx = this.toUserContext(user);
        const now = new Date();
        const newOrder: Workorder = {
            id: this.nextId++,
            title: data.title,
            description: data.description,
            priority: data.priority,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            assignedTo: data.assignedTo,
            status: data.status ?? 'pending',
            createdAt: now,
            updatedAt: now,
            completedAt: null,
        };

        if (newOrder.status === 'completed') {
            newOrder.completedAt = now;
        }

        this.workorders.push(newOrder);
        this.ensureTimeline(newOrder.id);
        this.addTimelineEvent(newOrder.id, {
            type: 'created',
            description: 'Ordem de serviço criada',
            userId: userCtx.userId,
            userName: userCtx.name ?? userCtx.username ?? null,
            metadata: { status: newOrder.status },
        });

        if (newOrder.assignedTo) {
            this.addTimelineEvent(newOrder.id, {
                type: 'assigned',
                description: `Ordem atribuída para ${newOrder.assignedTo}`,
                userId: userCtx.userId,
                userName: userCtx.name ?? userCtx.username ?? null,
            });
        }

        if (newOrder.status !== 'pending') {
            this.addTimelineEvent(newOrder.id, {
                type: 'status_change',
                description: `Status alterado para ${newOrder.status}`,
                userId: userCtx.userId,
                userName: userCtx.name ?? userCtx.username ?? null,
                metadata: { status: newOrder.status },
            });
        }

        this.log.info(userCtx.userId, 'CREATE_WORKORDER', { orderId: newOrder.id });

        return this.serializeOrder(newOrder);
    }

    findAll(options: FindAllOptions, user: any): { orders: WorkorderResponse[]; total: number } {
        const userCtx = this.toUserContext(user);
        const statusFilter = options.status && options.status !== 'all' ? options.status : undefined;
        const priorityFilter = options.priority && options.priority !== 'all' ? options.priority : undefined;
        const search = options.search?.toLowerCase();

        let filtered = [...this.workorders];

        if (statusFilter) {
            filtered = filtered.filter((order) => order.status === statusFilter);
        }

        if (priorityFilter) {
            filtered = filtered.filter((order) => order.priority === priorityFilter);
        }

        if (search) {
            filtered = filtered.filter(
                (order) =>
                    order.title.toLowerCase().includes(search) ||
                    order.clientName.toLowerCase().includes(search) ||
                    order.clientEmail.toLowerCase().includes(search),
            );
        }

        const page = options.page && options.page > 0 ? options.page : 1;
        const limit = options.limit && options.limit > 0 ? options.limit : filtered.length || 10;
        const startIndex = (page - 1) * limit;
        const paginated = filtered.slice(startIndex, startIndex + limit).map((order) => this.serializeOrder(order));

        this.log.info(userCtx.userId, 'LIST_WORKORDERS', {
            total: filtered.length,
            page,
            limit,
            status: statusFilter,
            priority: priorityFilter,
        });

        return {
            orders: paginated,
            total: filtered.length,
        };
    }

    findOne(id: number, user: any): WorkorderResponse {
        const userCtx = this.toUserContext(user);
        const order = this.workorders.find((o) => o.id === id);
        if (!order) {
            this.log.warn(userCtx.userId, 'FIND_WORKORDER_FAIL', { orderId: id });
            throw new NotFoundException('Workorder não encontrada');
        }
        this.log.info(userCtx.userId, 'FIND_WORKORDER_SUCCESS', { orderId: id });
        return this.serializeOrder(order);
    }

    update(id: number, data: Partial<Workorder>, user: any): WorkorderResponse {
        const userCtx = this.toUserContext(user);
        const order = this.getEntityOrFail(id);
        const previousStatus = order.status;
        const previousAssigned = order.assignedTo;

        Object.assign(order, data, { updatedAt: new Date() });

        if (data.status && data.status !== previousStatus) {
            if (data.status === 'completed') {
                order.completedAt = data.completedAt ?? new Date();
            } else {
                order.completedAt = null;
            }

            this.addTimelineEvent(order.id, {
                type: 'status_change',
                description: `Status alterado para ${data.status}`,
                userId: userCtx.userId,
                userName: userCtx.name ?? userCtx.username ?? null,
                metadata: { from: previousStatus, to: data.status },
            });
        }

        if (data.assignedTo && data.assignedTo !== previousAssigned) {
            this.addTimelineEvent(order.id, {
                type: 'assigned',
                description: `Ordem atribuída para ${data.assignedTo}`,
                userId: userCtx.userId,
                userName: userCtx.name ?? userCtx.username ?? null,
                metadata: { from: previousAssigned, to: data.assignedTo },
            });
        }

        this.log.info(userCtx.userId, 'UPDATE_WORKORDER', {
            orderId: id,
            fields: Object.keys(data),
        });

        return this.serializeOrder(order);
    }

    remove(id: number, user: any) {
        const userCtx = this.toUserContext(user);
        const index = this.workorders.findIndex((o) => o.id === id);
        if (index === -1) {
            this.log.warn(userCtx.userId, 'REMOVE_WORKORDER_FAIL', { orderId: id });
            throw new NotFoundException('Workorder não encontrada');
        }

        this.workorders.splice(index, 1);
        this.timelines.delete(id);
        this.log.info(userCtx.userId, 'REMOVE_WORKORDER_SUCCESS', { orderId: id });

        return { message: 'Workorder removida com sucesso' };
    }

    addComment(orderId: number, note: string, user: any) {
        const userCtx = this.toUserContext(user);
        this.getEntityOrFail(orderId);
        this.addTimelineEvent(orderId, {
            type: 'comment',
            description: note,
            userId: userCtx.userId,
            userName: userCtx.name ?? userCtx.username ?? null,
        });
    }

    getTimeline(orderId: number, user: any): Array<Omit<TimelineEvent, 'timestamp'> & { timestamp: string }> {
        const userCtx = this.toUserContext(user);
        this.getEntityOrFail(orderId);
        const events = this.timelines.get(orderId) ?? [];

        this.log.info(userCtx.userId, 'LIST_TIMELINE', { orderId, totalEvents: events.length });

        return events
            .slice()
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
            .map((event) => ({
                ...event,
                timestamp: event.timestamp.toISOString(),
            }));
    }
}
