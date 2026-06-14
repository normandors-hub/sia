import { syncOmieProducts, getProducts } from "@/app/actions/omie"
import { PageHeader } from "@/components/page-header"
import { SyncButton } from "@/components/sync-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatNumber } from "@/lib/format"
import { Package } from "lucide-react"

export default async function ProdutosPage() {
  const list = await getProducts()

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Cadastros importados do Omie. Use a sincronização para atualizar."
        actions={<SyncButton action={syncOmieProducts} label="Produtos" />}
      />
      <div className="p-6">
        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>NCM</TableHead>
                  <TableHead>Un.</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Peso Líq.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.code ?? "-"}</TableCell>
                    <TableCell>{p.description}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.ncm ?? "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.unit ?? "-"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.unitPrice ? formatCurrency(p.unitPrice) : "-"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {p.netWeight ? formatNumber(p.netWeight) : "-"}
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground">Nenhum produto importado</p>
        <p className="text-sm text-muted-foreground">
          Clique em &quot;Sincronizar Omie&quot; para importar os cadastros.
        </p>
      </div>
    </div>
  )
}
