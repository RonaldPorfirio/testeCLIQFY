import type { TimelineEvent } from "@/lib/types"
import { CheckCircle2, Clock, MessageSquare, UserPlus, FileText } from "lucide-react"

interface TimelineProps {
  events: TimelineEvent[]
}

const eventIcons = {
  created: FileText,
  status_change: Clock,
  assigned: UserPlus,
  comment: MessageSquare,
  completed: CheckCircle2,
}

const eventColors = {
  created: "text-blue-500",
  status_change: "text-yellow-500",
  assigned: "text-purple-500",
  comment: "text-gray-500",
  completed: "text-green-500",
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const Icon = eventIcons[event.type]
        const colorClass = eventColors[event.type]

        return (
          <div key={event.id} className="relative flex gap-4">
            {/* Timeline line */}
            {index !== events.length - 1 && <div className="absolute left-[15px] top-8 h-full w-px bg-border" />}

            {/* Icon */}
            <div
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-border ${colorClass}`}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1 pb-6">
              <p className="text-sm font-medium text-foreground">{event.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{event.userName}</span>
                <span>•</span>
                <span>{new Date(event.timestamp).toLocaleString("pt-BR")}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
