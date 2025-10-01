export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "agent" | "viewer"
  username?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface ServiceOrder {
  id: string
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  clientName: string
  clientEmail: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface TimelineEvent {
  id: string
  orderId: string
  type: "created" | "status_change" | "assigned" | "comment" | "completed"
  description: string
  userId: string | null
  userName: string | null
  timestamp: string
  metadata?: Record<string, any>
}

export interface Report {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  inProgressOrders: number
  averageCompletionTime: number
  ordersByStatus: Array<{ status: string; count: number }>
  ordersByPriority: Array<{ priority: string; count: number }>
}
