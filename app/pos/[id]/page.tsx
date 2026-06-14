import { getPurchaseOrder } from "@/app/actions/purchase-orders"
import { DocToolbar } from "@/components/documents/doc-toolbar"
import { DocumentView } from "@/components/documents/document-view"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DOC_TYPES, type DocType, formatCurrency } from "@/lib/format"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

const DOC_ORDER: DocType[] = [
  "invoice",
  "pfi",
  "packing_list",
  "credit_note",
  "payment_instruction",
  "warehouse_letter",
]

export default async function PoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const po = await getPurchaseOrder(Number(id))
  if (!po) notFound()

  return (
    <div>
      <div className="no-print">
        <PageHeader
          title={`PO ${po.poNumber}`}
          description={po.clientName ?? undefined}
          actions={
            <Button render={<Link href="/" />} variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          }
        />

        <div className="flex flex-col gap-4 border-b border-border bg-card px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <StatusBadge status={po.status} />
            </span>
            {po.invoiceNumber ? (
              <span>
                <span className="text-muted-foreground">Invoice: </span>
                {po.invoiceNumber}
              </span>
            ) : null}
            <span>
              <span className="text-muted-foreground">Total: </span>
              <span className="font-medium tabular-nums">
                {formatCurrency(po.totalAmount, po.currency ?? "USD")}
              </span>
            </span>
          </div>
          <DocToolbar poId={po.id} status={po.status} />
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="invoice" className="w-full">
          <TabsList className="no-print mb-4 flex h-auto flex-wrap justify-start gap-1 bg-muted/60">
            {DOC_ORDER.map((d) => (
              <TabsTrigger key={d} value={d} className="text-xs">
                {DOC_TYPES[d]}
              </TabsTrigger>
            ))}
          </TabsList>

          {DOC_ORDER.map((d) => (
            <TabsContent key={d} value={d} className="mt-0">
              <DocumentView po={po} docType={d} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
