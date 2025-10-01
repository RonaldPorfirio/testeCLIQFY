import { Injectable } from '@nestjs/common';
import { Checkin } from './checkin.entity';
import { WorkordersService } from '../workorders/workorders.service';

@Injectable()
export class CheckinsService {
    private checkins: Checkin[] = [];
    private nextId = 1;

    constructor(private readonly workordersService: WorkordersService) { }

    create(workorderId: number, user: any, note: string): Checkin {
        // Garante que a ordem exista (lança exceção se não existir)
        this.workordersService.findOne(workorderId, user);

        const newCheckin: Checkin = {
            id: this.nextId++,
            workorderId,
            userId: user?.userId ?? null,
            note,
            createdAt: new Date(),
        };

        this.checkins.push(newCheckin);

        // Registra nota na timeline da ordem
        this.workordersService.addComment(workorderId, note, user);

        return newCheckin;
    }

    findByWorkorder(workorderId: number): Checkin[] {
        return this.checkins.filter((c) => c.workorderId === workorderId);
    }

    findAll(): Checkin[] {
        return this.checkins;
    }
}
