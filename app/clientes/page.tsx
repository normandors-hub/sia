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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, ChevronLeft, ChevronRight, Search } from "lucide-react"
import Link from "next/link"

const PER_PAGE = 50

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { search, page } = await searchParams
  const currentPage = Math.max(1, Number(page ?? 1))
  const list = await getClients(search, currentPage, PER_PAGE)

  const totalPages = Math.ceil(list.total / PER_PAGE)

  function buildUrl(p: number) {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    params.set("page", String(p))
    return `/clientes?${params.toString()}`
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastros importados do Omie. Use a sincronização para atualizar."
        actions={<SyncButton action={syncOmieClients} label="Clientes" />}
      />
      <div className="p-6 space-y-4">

        {/* Barra de busca */}
        <form method="GET" action="/clientes" className="flex gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={search ?? ""}
              placeholder="Buscar por nome ou CNPJ..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">Buscar</Button>
          {search && (
            <Button variant="ghost" render={<Link href="/clientes" />}>
              Limpar
            </Button>
          )}
        </form>

        {list.items.length === 0 ? (
          <EmptyState hasSearch={!!search} />
        ) : (
          <>
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
                  {list.items.map((c) => (
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

            {/* Paginação */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>
                Mostrando {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, list.total)} de {list.total} clientes
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  render={<Link href={buildUrl(currentPage - 1)} />}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="px-2">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  render={<Link href={buildUrl(currentPage + 1)} />}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        {hasSearch ? (
          <>
            <p className="font-medium text-foreground">Nenhum cliente encontrado</p>
            <p className="text-sm text-muted-foreground">
              Tente buscar por outro nome ou CNPJ.
            </p>
          </>
        ) : (
          <>
            <p className="font-medium text-foreground">Nenhum cliente importado</p>
            <p className="text-sm text-muted-foreground">
              Clique em &quot;Sincronizar Omie&quot; para importar os cadastros.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
