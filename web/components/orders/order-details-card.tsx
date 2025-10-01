import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ServiceOrder } from "@/lib/types"
import { Calendar, Clock, Mail, User, AlertCircle } from "lucide-react"

interface OrderDetailsCardProps {
  order: ServiceOrder
}

const statusLabels = {
  pending: "Pendente",
  in_progress: "Em Progresso",
  completed: "Concluído",
  cancelled: "Cancelado",
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

const priorityLabels = {
  urgent: "Urgente",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
}

const priorityColors = {
  urgent: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-green-500/10 text-green-500 border-green-500/20",
}

export function OrderDetailsCard({ order }: OrderDetailsCardProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-2xl text-foreground">{order.title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className={statusColors[order.status]}>
              {statusLabels[order.status]}
            </Badge>
            <Badge variant="outline" className={priorityColors[order.priority]}>
              {priorityLabels[order.priority]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
          <p className="text-foreground leading-relaxed">{order.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Informações do Cliente</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{order.clientName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{order.clientEmail}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Detalhes da Ordem</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  Criado em {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              {order.assignedTo && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">Atribuído: {order.assignedTo}</span>
                </div>
              )}
              {order.completedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    Concluído em {new Date(order.completedAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
