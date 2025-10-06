"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { OrderDetailsCard } from "@/components/domain/orders/order-details-card"
import { Timeline } from "@/components/domain/orders/timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { ArrowLeft, Loader2 } from "lucide-react"

function OrderDetailPageContent() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => apiClient.getOrderById(orderId),
  })

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ["timeline", orderId],
    queryFn: () => apiClient.getOrderTimeline(orderId),
  })

  const isLoading = orderLoading || timelineLoading

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl p-6">
        <Button variant="ghost" onClick={() => router.push("/orders")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Ordens
        </Button>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && order && timeline && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <OrderDetailsCard order={order} />
            </div>

            <div className="lg:col-span-1">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <Timeline events={timeline} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailPageContent />
    </ProtectedRoute>
  )
}
