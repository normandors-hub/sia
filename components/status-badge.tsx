import { Badge } from "@/components/ui/badge"
import { STATUS_LABELS } from "@/lib/format"
import { cn } from "@/lib/utils"

const styles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  confirmed: "bg-accent text-accent-foreground",
  shipped: "bg-chart-2/15 text-chart-2",
  closed: "bg-chart-3/15 text-chart-3",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn("border-0 font-medium", styles[status] ?? styles.draft)}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
