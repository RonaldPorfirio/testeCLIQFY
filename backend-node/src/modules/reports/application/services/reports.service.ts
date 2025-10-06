import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReportsService {
    private baseUrl = 'http://localhost:5137/reports'; // URL do serviço .NET

    constructor(private readonly http: HttpService) { }

    async getDailyReport() {
        try {
            const res = await firstValueFrom(this.http.get(`${this.baseUrl}/daily`));
            return res.data;
        } catch (error) {
            throw new HttpException(
                'Erro ao buscar relatório no serviço .NET',
                500,
            );
        }
    }

    // Mapeia o relatório diário do serviço .NET para o formato esperado pelo front-end
    async getAggregatedReport() {
        const daily = await this.getDailyReport();

        const total = Number(daily?.totalWorkorders ?? daily?.TotalWorkorders ?? 0);
        const done = Number(daily?.done ?? daily?.Done ?? 0);
        const inProgress = Number(daily?.inProgress ?? daily?.InProgress ?? 0);
        const open = Number(daily?.open ?? daily?.Open ?? 0);

        return {
            totalOrders: total,
            completedOrders: done,
            pendingOrders: open,
            inProgressOrders: inProgress,
            // Sem dado de tempo médio no serviço .NET; manter 0 por enquanto
            averageCompletionTime: 0,
            ordersByStatus: [
                { status: 'completed', count: done },
                { status: 'in_progress', count: inProgress },
                { status: 'pending', count: open },
            ],
            // O serviço .NET não provê distribuição por prioridade; retornamos zeros
            ordersByPriority: [
                { priority: 'urgent', count: 0 },
                { priority: 'high', count: 0 },
                { priority: 'medium', count: 0 },
                { priority: 'low', count: 0 },
            ],
        };
    }
}

