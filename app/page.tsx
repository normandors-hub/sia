import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPurchaseOrders } from "@/app/actions/purchase-orders"
import { formatCurrency, formatDate } from "@/lib/format"
import { FileText, Plus } from "lucide-react"
import Link from "next/link"

export default async function POListPage() {
  const orders = await getPurchaseOrders()

  return (
    <div>
      <PageHeader
        title="Pedidos de Compra (PO)"
        description="Cadastre o pedido uma vez e gere todos os documentos de exportação automaticamente."
        actions={
          <Button render={<Link href="/pos/new" />}>
            <Plus className="h-4 w-4" />
            Novo PO
          </Button>
        }
      />

      <div className="p-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Nenhum PO cadastrado</p>
              <p className="text-sm text-muted-foreground">
                Comece criando um pedido para emitir os documentos.
              </p>
            </div>
            <Button render={<Link href="/pos/new" />} className="mt-2">
              <Plus className="h-4 w-4" />
              Criar primeiro PO
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>PO</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.poNumber}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {po.invoiceNumber ?? "-"}
                    </TableCell>
                    <TableCell>{po.clientName ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(po.issueDate)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(po.totalAmount, po.currency ?? "USD")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={po.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        render={<Link href={`/pos/${po.id}`} />}
                        variant="ghost"
                        size="sm"
                      >
                        Abrir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
