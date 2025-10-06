export type TimelineEventType = 'created' | 'status_change' | 'assigned' | 'comment'

export interface TimelineEvent {
  id: number
  orderId: number
  type: TimelineEventType
  description: string
  userId: number | null
  userName: string | null
  timestamp: Date
  metadata?: Record<string, any>
}

export type TimelineEventInput = Omit<TimelineEvent, 'id' | 'timestamp' | 'orderId'> & {
  timestamp?: Date
}

