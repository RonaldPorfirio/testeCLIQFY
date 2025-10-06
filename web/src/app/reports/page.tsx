"use client"

import { useQuery } from "@tanstack/react-query"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { StatsCard } from "@/components/domain/reports/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { CheckCircle2, Clock, FileText, Loader2, TrendingUp } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Pie, PieChart, Cell } from "recharts"

const STATUS_COLORS = {
  completed: "#22c55e",
  in_progress: "#3b82f6",
  pending: "#eab308",
  cancelled: "#ef4444",
}

const PRIORITY_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"]

function ReportsPageContent() {
  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reports"],
    queryFn: () => apiClient.getReports(),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl p-6">
          <div className="rounded-md bg-destructive/10 p-4 text-destructive">
            Erro ao carregar relatórios. Tente novamente.
          </div>
        </main>
      </div>
    )
  }

  const statusChartData = report.ordersByStatus.map((item) => ({
    name:
      item.status === "completed"
        ? "Concluído"
        : item.status === "in_progress"
          ? "Em Progresso"
          : item.status === "pending"
            ? "Pendente"
            : "Cancelado",
    value: item.count,
    fill: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS],
  }))

  const priorityChartData = report.ordersByPriority.map((item) => ({
    name:
      item.priority === "urgent"
        ? "Urgente"
        : item.priority === "high"
          ? "Alta"
          : item.priority === "medium"
            ? "Média"
            : "Baixa",
    value: item.count,
  }))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios e Análises</h1>
          <p className="text-muted-foreground">Visão geral do desempenho das ordens de serviço</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total de Ordens"
            value={report.totalOrders}
            description="Todas as ordens registradas"
            icon={FileText}
          />
          <StatsCard
            title="Ordens Concluídas"
            value={report.completedOrders}
            description={`${Math.round((report.completedOrders / report.totalOrders) * 100)}% do total`}
            icon={CheckCircle2}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Em Progresso"
            value={report.inProgressOrders}
            description="Ordens sendo executadas"
            icon={Clock}
          />
          <StatsCard
            title="Tempo Médio"
            value={`${report.averageCompletionTime} dias`}
            description="Para conclusão"
            icon={TrendingUp}
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Ordens por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusChartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Ordens por Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Resumo Detalhado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round((report.completedOrders / report.totalOrders) * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ordens Pendentes</p>
                  <p className="text-2xl font-bold text-foreground">{report.pendingOrders}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Distribuição por Status</h3>
                {report.ordersByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-foreground capitalize">
                      {item.status === "completed"
                        ? "Concluído"
                        : item.status === "in_progress"
                          ? "Em Progresso"
                          : item.status === "pending"
                            ? "Pendente"
                            : "Cancelado"}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${(item.count / report.totalOrders) * 100}%`,
                            backgroundColor: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS],
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground w-12 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsPageContent />
    </ProtectedRoute>
  )
}
