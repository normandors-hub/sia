"use client"

import { updatePoStatus } from "@/app/actions/purchase-orders"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STATUS_LABELS } from "@/lib/format"
import { Printer } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

export function DocToolbar({
  poId,
  status,
}: {
  poId: number
  status: string
}) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function changeStatus(value: string | null) {
    if (!value) return
    startTransition(async () => {
      await updatePoStatus(poId, value)
      toast.success("Status atualizado.")
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={changeStatus} disabled={pending}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={() => window.print()} variant="outline">
        <Printer className="h-4 w-4" />
        Imprimir / PDF
      </Button>
    </div>
  )
}
