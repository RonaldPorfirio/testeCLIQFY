"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { OrderFilters } from "@/components/orders/order-filters"
import { OrderCard } from "@/components/orders/order-card"
import { Pagination } from "@/components/orders/pagination"
import { apiClient } from "@/lib/api"
import { Loader2 } from "lucide-react"

function OrdersPageContent() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", statusFilter, currentPage],
    queryFn: () =>
      apiClient.getOrders({
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: currentPage,
        limit: itemsPerPage,
      }),
  })

  const filteredOrders = data?.orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter

    return matchesSearch && matchesPriority
  })

  const totalPages = Math.ceil((filteredOrders?.length || 0) / itemsPerPage)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gerencie e acompanhe todas as ordens de serviço</p>
        </div>

        <div className="mb-6">
          <OrderFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive">
            Erro ao carregar ordens de serviço. Tente novamente.
          </div>
        )}

        {!isLoading && !error && filteredOrders && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">Nenhuma ordem de serviço encontrada.</div>
            )}

            {filteredOrders.length > 0 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersPageContent />
    </ProtectedRoute>
  )
}
