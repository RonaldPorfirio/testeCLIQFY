import type { Workorder, WorkorderPriority, WorkorderStatus } from '../entities/workorder.entity'
import type { TimelineEvent, TimelineEventInput } from '../entities/timeline-event.entity'

export interface WorkorderFilters {
  status?: string
  priority?: string
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedWorkorders {
  data: Workorder[]
  total: number
}

export interface CreateWorkorderInput {
  title: string
  description: string
  priority: WorkorderPriority
  clientName: string
  clientEmail: string
  assignedTo?: string
  status?: WorkorderStatus
}

export type UpdateWorkorderInput = Partial<Omit<Workorder, 'id'>>

export interface WorkorderRepository {
  findAll(filters: WorkorderFilters): Promise<PaginatedWorkorders>
  findById(id: number): Promise<Workorder | null>
  create(data: CreateWorkorderInput): Promise<Workorder>
  update(id: number, data: UpdateWorkorderInput): Promise<Workorder>
  remove(id: number): Promise<void>
  getTimeline(orderId: number): Promise<TimelineEvent[]>
  addTimelineEvent(orderId: number, input: TimelineEventInput): Promise<TimelineEvent>
}

export const WORKORDER_REPOSITORY = Symbol('WORKORDER_REPOSITORY')

