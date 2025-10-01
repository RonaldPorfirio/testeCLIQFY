export type WorkorderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type WorkorderPriority = 'low' | 'medium' | 'high' | 'urgent';

export class Workorder {
    id: number;
    title: string;
    description: string;
    status: WorkorderStatus;
    priority: WorkorderPriority;
    clientName: string;
    clientEmail: string;
    assignedTo?: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date | null;
}
