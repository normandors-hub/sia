"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

export function SyncButton({
  action,
  label,
}: {
  action: () => Promise<{ ok: boolean; count?: number; error?: string }>
  label: string
}) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleSync() {
    startTransition(async () => {
      const res = await action()
      if (res.ok) {
        toast.success(`${label}: ${res.count ?? 0} registros sincronizados.`)
        router.refresh()
      } else {
        toast.error(res.error ?? "Falha na sincronização.")
      }
    })
  }

  return (
    <Button onClick={handleSync} disabled={pending} variant="outline">
      <RefreshCw className={pending ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
      {pending ? "Sincronizando..." : "Sincronizar Omie"}
    </Button>
  )
}
