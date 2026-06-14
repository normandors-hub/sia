import { getClients, getProducts } from "@/app/actions/omie"
import { PageHeader } from "@/components/page-header"
import { PoForm } from "@/components/po-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewPoPage() {
  const [clients, products] = await Promise.all([getClients(), getProducts()])

  return (
    <div>
      <PageHeader
        title="Novo Pedido de Compra"
        description="Preencha os dados do pedido e os itens. Os documentos serão gerados a partir daqui."
        actions={
          <Button render={<Link href="/" />} variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        }
      />
      <PoForm clients={clients} products={products} />
    </div>
  )
}
