import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../prisma/prisma.service';
import { WorkordersService } from '@modules/workorders/application/services/workorders.service';
import { TimelineEventType } from '@prisma/client';
import { Checkin } from '@modules/checkins/domain/entities/checkin.entity';

interface CreateCheckinPayload {
  note: string;
  latitude?: number | null;
  longitude?: number | null;
  photo?: string | null;
}

@Injectable()
export class CheckinsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workordersService: WorkordersService,
  ) {}

  async create(workorderId: number, user: any, payload: CreateCheckinPayload): Promise<Checkin> {
    await this.workordersService.findOne(workorderId, user);

    const checkin = await this.prisma.$transaction(async (tx) => {
      const created = await tx.checkin.create({
        data: {
          workorderId,
          userId: user?.userId ?? null,
          note: payload.note,
          latitude: payload.latitude ?? null,
          longitude: payload.longitude ?? null,
          photo: payload.photo ?? null,
        },
      });

      const commentNote =
        payload.latitude != null && payload.longitude != null
          ? `${created.note} (GPS: ${payload.latitude.toFixed(5)}, ${payload.longitude.toFixed(5)})`
          : created.note;

      await tx.timelineEvent.create({
        data: {
          orderId: workorderId,
          type: TimelineEventType.comment,
          description: commentNote,
          userId: user?.userId ?? null,
          userName: user?.name ?? user?.username ?? null,
        },
      });

      return created;
    });

    return {
      id: checkin.id,
      workorderId: checkin.workorderId,
      userId: checkin.userId ?? null,
      note: checkin.note,
      createdAt: checkin.createdAt,
      latitude: checkin.latitude ?? null,
      longitude: checkin.longitude ?? null,
      photo: checkin.photo ?? null,
    };
  }

  async findByWorkorder(workorderId: number): Promise<Checkin[]> {
    const records = await this.prisma.checkin.findMany({
      where: { workorderId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((checkin) => ({
      id: checkin.id,
      workorderId: checkin.workorderId,
      userId: checkin.userId ?? null,
      note: checkin.note,
      createdAt: checkin.createdAt,
      latitude: checkin.latitude ?? null,
      longitude: checkin.longitude ?? null,
      photo: checkin.photo ?? null,
    }));
  }

  async findAll(): Promise<Checkin[]> {
    const records = await this.prisma.checkin.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return records.map((checkin) => ({
      id: checkin.id,
      workorderId: checkin.workorderId,
      userId: checkin.userId ?? null,
      note: checkin.note,
      createdAt: checkin.createdAt,
      latitude: checkin.latitude ?? null,
      longitude: checkin.longitude ?? null,
      photo: checkin.photo ?? null,
    }));
  }
}
