import { render, screen } from "@testing-library/react"
import { StatsCard } from "@/components/domain/reports/stats-card"
import { FileText } from "lucide-react"

describe("StatsCard", () => {
  it("renders title, value and description", () => {
    render(
      <StatsCard
        title="Total de Ordens"
        value={45}
        description="Todas as ordens registradas"
        icon={FileText}
      />,
    )

    expect(screen.getByText("Total de Ordens")).toBeInTheDocument()
    expect(screen.getByText("45")).toBeInTheDocument()
    expect(screen.getByText("Todas as ordens registradas")).toBeInTheDocument()
  })

  it("shows positive trend with + sign and green color", () => {
    render(
      <StatsCard
        title="Concluídas"
        value={32}
        description="Percentual concluído"
        icon={FileText}
        trend={{ value: 12, isPositive: true }}
      />,
    )

    const trend = screen.getByText((t) => t.includes("+12%"))
    expect(trend).toBeInTheDocument()
    expect(trend).toHaveClass("text-green-500")
  })

  it("shows negative trend with red color", () => {
    render(
      <StatsCard
        title="Concluídas"
        value={30}
        icon={FileText}
        trend={{ value: 5, isPositive: false }}
      />,
    )

    const trend = screen.getByText((t) => t.includes("5%"))
    expect(trend).toBeInTheDocument()
    expect(trend).toHaveClass("text-red-500")
  })
})
