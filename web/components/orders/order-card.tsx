import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ServiceOrder } from "@/lib/types"
import { Clock, User, Calendar } from "lucide-react"
import Link from "next/link"

interface OrderCardProps {
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

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="transition-colors hover:bg-accent/50 cursor-pointer border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-foreground leading-tight">{order.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{order.description}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className={statusColors[order.status]}>
                {statusLabels[order.status]}
              </Badge>
              <Badge variant="outline" className={priorityColors[order.priority]}>
                {priorityLabels[order.priority]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{order.clientName}</span>
          </div>
          {order.assignedTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Atribuído: {order.assignedTo}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
