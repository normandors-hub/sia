import { syncOmieClients, getClients } from "@/app/actions/omie"
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
import { Users } from "lucide-react"

export default async function ClientesPage() {
  const list = await getClients()

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastros importados do Omie. Use a sincronização para atualizar."
        actions={<SyncButton action={syncOmieClients} label="Clientes" />}
      />
      <div className="p-6">
        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Razão Social</TableHead>
                  <TableHead>CNPJ/CPF</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>E-mail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.document ?? "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {[c.city, c.state].filter(Boolean).join("/") || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.country ?? "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.email ?? "-"}
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
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground">Nenhum cliente importado</p>
        <p className="text-sm text-muted-foreground">
          Clique em &quot;Sincronizar Omie&quot; para importar os cadastros.
        </p>
      </div>
    </div>
  )
}
