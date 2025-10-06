"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface OrderFiltersProps {
  statusFilter: string
  onStatusChange: (status: string) => void
  priorityFilter: string
  onPriorityChange: (priority: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function OrderFilters({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  searchQuery,
  onSearchChange,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, cliente..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="in_progress">Em Progresso</SelectItem>
          <SelectItem value="completed">Concluído</SelectItem>
          <SelectItem value="cancelled">Cancelado</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas Prioridades</SelectItem>
          <SelectItem value="urgent">Urgente</SelectItem>
          <SelectItem value="high">Alta</SelectItem>
          <SelectItem value="medium">Média</SelectItem>
          <SelectItem value="low">Baixa</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
