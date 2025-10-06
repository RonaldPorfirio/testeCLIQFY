import type { LoginCredentials, AuthResponse, ServiceOrder, TimelineEvent, Report, User } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
// Permite desabilitar mocks em desenvolvimento setando NEXT_PUBLIC_USE_MOCKS=false
const USE_MOCKS = (process.env.NEXT_PUBLIC_USE_MOCKS ?? "true").toLowerCase() === "true"
// Permite forçar uso da API real para relatórios, mesmo com mocks habilitados
const REPORTS_USE_REAL = (process.env.NEXT_PUBLIC_REPORTS_USE_REAL ?? "true").toLowerCase() === "true"

// Mock data for development
const MOCK_USER = {
  id: "1",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin" as const,
  username: "admin",
}

const MOCK_ORDERS: ServiceOrder[] = [
  {
    id: "1",
    title: "Instalação de Sistema de Ar Condicionado",
    description: "Instalação completa de sistema split em escritório comercial",
    status: "in_progress",
    priority: "high",
    clientName: "Empresa ABC Ltda",
    clientEmail: "contato@empresaabc.com",
    assignedTo: "João Silva",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-16T14:30:00Z",
  },
  {
    id: "2",
    title: "Manutenção Preventiva - Sistema Elétrico",
    description: "Verificação e manutenção do sistema elétrico predial",
    status: "pending",
    priority: "medium",
    clientName: "Condomínio Residencial XYZ",
    clientEmail: "sindico@condominioxyz.com",
    createdAt: "2025-01-16T09:00:00Z",
    updatedAt: "2025-01-16T09:00:00Z",
  },
  {
    id: "3",
    title: "Reparo de Vazamento Hidráulico",
    description: "Correção de vazamento em tubulação principal",
    status: "completed",
    priority: "urgent",
    clientName: "Maria Santos",
    clientEmail: "maria.santos@email.com",
    assignedTo: "Pedro Costa",
    createdAt: "2025-01-14T08:00:00Z",
    updatedAt: "2025-01-15T16:00:00Z",
    completedAt: "2025-01-15T16:00:00Z",
  },
]

class ApiClient {
  private token: string | null = null
  private refreshToken: string | null = null
  private isRefreshing = false
  private refreshPromise: Promise<boolean> | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
      this.refreshToken = localStorage.getItem("refresh_token")
    }
  }

  setTokens(token: string, refreshToken?: string) {
    this.token = token
    if (refreshToken) {
      this.refreshToken = refreshToken
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken)
      } else if (this.refreshToken) {
        localStorage.setItem("refresh_token", this.refreshToken)
      }
    }
  }

  clearTokens() {
    this.token = null
    this.refreshToken = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
    }
  }

  private normalizeUser(user: any): User {
    return {
      id: String(user?.id ?? user?.userId ?? ""),
      email: user?.email ?? "",
      name: user?.name ?? user?.username ?? user?.email ?? "",
      role: (user?.role ?? "viewer") as User["role"],
      username: user?.username,
    }
  }

  private normalizeOrder(raw: any): ServiceOrder {
    return {
      id: String(raw?.id ?? ""),
      title: raw?.title ?? "",
      description: raw?.description ?? "",
      status: (raw?.status ?? "pending") as ServiceOrder["status"],
      priority: (raw?.priority ?? "medium") as ServiceOrder["priority"],
      clientName: raw?.clientName ?? "",
      clientEmail: raw?.clientEmail ?? "",
      assignedTo: raw?.assignedTo ?? undefined,
      createdAt: raw?.createdAt ?? new Date().toISOString(),
      updatedAt: raw?.updatedAt ?? new Date().toISOString(),
      completedAt: raw?.completedAt ?? undefined,
    }
  }

  private normalizeTimelineEvent(raw: any): TimelineEvent {
    return {
      id: String(raw?.id ?? `${raw?.timestamp}-${raw?.type}`),
      orderId: String(raw?.orderId ?? ""),
      type: (raw?.type ?? "comment") as TimelineEvent["type"],
      description: raw?.description ?? "",
      userId: raw?.userId !== undefined && raw?.userId !== null ? String(raw.userId) : null,
      userName: raw?.userName ?? null,
      timestamp: raw?.timestamp ?? new Date().toISOString(),
      metadata: raw?.metadata,
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
    }

    // Mock API responses quando habilitado via flag
    // Exceto para /reports se REPORTS_USE_REAL=true
    if (USE_MOCKS && !(REPORTS_USE_REAL && endpoint === "/reports")) {
      return this.mockRequest<T>(endpoint, requestOptions)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions)

    if (response.status === 401 && retry && this.refreshToken) {
      const refreshed = await this.refreshTokens()
      if (refreshed) {
        return this.request<T>(endpoint, options, false)
      }
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`API Error: ${response.status} ${errorText}`)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  private async refreshTokens(): Promise<boolean> {
    if (!this.refreshToken) {
      return false
    }

    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.refreshToken}`,
          },
        })

        if (!response.ok) {
          throw new Error("Refresh token inválido")
        }

        const data = (await response.json()) as { token: string; refreshToken?: string }
        this.setTokens(data.token, data.refreshToken ?? this.refreshToken)
        return true
      } catch (error) {
        this.clearTokens()
        return false
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  private async mockRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (endpoint === "/auth/login" && options.method === "POST") {
      const body = JSON.parse(options.body as string) as LoginCredentials
      if (body.email === "admin@example.com" && body.password === "admin123") {
        return {
          user: MOCK_USER,
          token: "mock-jwt-token-" + Date.now(),
          refreshToken: "mock-refresh-token-" + Date.now(),
        } as T
      }
      throw new Error("Invalid credentials")
    }

    if (endpoint === "/auth/me") {
      return { user: MOCK_USER } as T
    }

    if (endpoint === "/auth/refresh") {
      return { token: "mock-jwt-token-" + Date.now(), refreshToken: "mock-refresh-token-" + Date.now() } as T
    }

    if (endpoint.startsWith("/orders")) {
      const method = (options.method ?? "GET").toString().toUpperCase()
      if (method === "GET") {
        if (endpoint.includes("/orders/") && !endpoint.includes("?")) {
          const orderId = endpoint.split("/")[2]
          const order = MOCK_ORDERS.find((o) => o.id === orderId)
          if (!order) throw new Error("Order not found")
          return order as T
        }
        return { orders: MOCK_ORDERS, total: MOCK_ORDERS.length } as T
      }
    }

    if (endpoint.startsWith("/timeline/")) {
      const orderId = endpoint.split("/")[2]
      const mockTimeline: TimelineEvent[] = [
        {
          id: "1",
          orderId,
          type: "created",
          description: "Ordem de serviço criada",
          userId: "1",
          userName: "Sistema",
          timestamp: "2025-01-15T10:00:00Z",
        },
        {
          id: "2",
          orderId,
          type: "assigned",
          description: "Atribuído para João Silva",
          userId: "1",
          userName: "Admin User",
          timestamp: "2025-01-15T10:30:00Z",
        },
        {
          id: "3",
          orderId,
          type: "status_change",
          description: "Status alterado para Em Progresso",
          userId: "2",
          userName: "João Silva",
          timestamp: "2025-01-16T08:00:00Z",
        },
        {
          id: "4",
          orderId,
          type: "comment",
          description: "Técnico chegou ao local e iniciou avaliação",
          userId: "2",
          userName: "João Silva",
          timestamp: "2025-01-16T09:15:00Z",
        },
      ]
      return mockTimeline as T
    }

    if (endpoint === "/reports") {
      const mockReport: Report = {
        totalOrders: 45,
        completedOrders: 32,
        pendingOrders: 8,
        inProgressOrders: 5,
        averageCompletionTime: 2.5,
        ordersByStatus: [
          { status: "completed", count: 32 },
          { status: "in_progress", count: 5 },
          { status: "pending", count: 8 },
        ],
        ordersByPriority: [
          { priority: "urgent", count: 5 },
          { priority: "high", count: 12 },
          { priority: "medium", count: 18 },
          { priority: "low", count: 10 },
        ],
      }
      return mockReport as T
    }

    throw new Error("Endpoint not mocked")
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
    return {
      user: this.normalizeUser(response.user),
      token: response.token,
      refreshToken: response.refreshToken,
    }
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await this.request<{ user: User }>("/auth/me")
    return { user: this.normalizeUser(response.user) }
  }

  async getOrders(params?: { status?: string; page?: number; limit?: number }): Promise<{
    orders: ServiceOrder[]
    total: number
  }> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append("status", params.status)
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())

    const query = queryParams.toString()
    const response = await this.request<{ orders: any[]; total: number }>(`/orders${query ? `?${query}` : ""}`)
    return {
      orders: response.orders.map((order) => this.normalizeOrder(order)),
      total: response.total,
    }
  }

  async getOrderById(id: string): Promise<ServiceOrder> {
    const response = await this.request<any>(`/orders/${id}`)
    return this.normalizeOrder(response)
  }

  async getOrderTimeline(orderId: string): Promise<TimelineEvent[]> {
    const response = await this.request<any[]>(`/timeline/${orderId}`)
    return response.map((event) => this.normalizeTimelineEvent({ orderId, ...event }))
  }

  async getReports(): Promise<Report> {
    return this.request<Report>("/reports")
  }
}

export const apiClient = new ApiClient()
