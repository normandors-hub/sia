"use client"

import { createPurchaseOrder, type PoItemInput } from "@/app/actions/purchase-orders"
import type { ParsedPo } from "@/app/actions/import-po"
import { PoImportDialog } from "@/components/po-import-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Bank, Client, Product } from "@/lib/db/schema"
import { formatCurrency } from "@/lib/format"
import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

type ItemRow = PoItemInput & { _key: string }

function emptyItem(): ItemRow {
  return {
    _key: crypto.randomUUID(),
    productId: null,
    code: "",
    description: "",
    ncm: "",
    unit: "",
    quantity: 0,
    unitPrice: 0,
    volume: null,
    netWeight: null,
    grossWeight: null,
    packages: null,
  }
}

export function PoForm({
  clients,
  products,
  banks,
}: {
  clients: Client[]
  products: Product[]
  banks: Bank[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const defaultBank = banks.find((b) => b.isDefault) ?? banks[0]
  const [bankId, setBankId] = useState<string>(
    defaultBank ? String(defaultBank.id) : "",
  )

  const [poNumber, setPoNumber] = useState("")
  const [pfiNumber, setPfiNumber] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [issueDate, setIssueDate] = useState("")
  const [clientId, setClientId] = useState<string>("")
  const [currency, setCurrency] = useState("USD")
  const [incoterm, setIncoterm] = useState("FOB")
  const [portOfLoading, setPortOfLoading] = useState("")
  const [portOfDischarge, setPortOfDischarge] = useState("")
  const [finalDestination, setFinalDestination] = useState("")
  const [countryOfDestination, setCountryOfDestination] = useState("")
  const [vessel, setVessel] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<ItemRow[]>([emptyItem()])
  const [importedClientName, setImportedClientName] = useState("")
  const [notifyParty, setNotifyParty] = useState("")

  const selectedClient = useMemo(
    () => clients.find((c) => String(c.id) === clientId),
    [clients, clientId],
  )

  function applyParsed(data: ParsedPo) {
    setPoNumber(data.poNumber ?? "")
    setPfiNumber(data.pfiNumber ?? "")
    setInvoiceNumber(data.invoiceNumber ?? "")
    setIssueDate(data.issueDate ?? "")
    if (data.currency) setCurrency(data.currency)
    if (data.incoterm) setIncoterm(data.incoterm)
    setPortOfLoading(data.portOfLoading ?? "")
    setPortOfDischarge(data.portOfDischarge ?? "")
    setFinalDestination(data.finalDestination ?? "")
    setCountryOfDestination(data.countryOfDestination ?? "")
    setVessel(data.vessel ?? "")
    setPaymentTerms(data.paymentTerms ?? "")
    setNotes(data.notes ?? "")
    setNotifyParty(data.notifyParty ?? "")

    // Tenta casar o cliente importado com a base existente
    setImportedClientName(data.clientName ?? "")
    if (data.clientName) {
      const target = data.clientName.toLowerCase()
      const match = clients.find(
        (c) =>
          c.name.toLowerCase() === target ||
          c.name.toLowerCase().includes(target) ||
          target.includes(c.name.toLowerCase()),
      )
      setClientId(match ? String(match.id) : "")
    }

    if (data.items?.length) {
      setItems(
        data.items.map((it) => ({
          _key: crypto.randomUUID(),
          productId: null,
          code: it.code ?? "",
          description: it.description ?? "",
          ncm: it.ncm ?? "",
          unit: it.unit ?? "",
          quantity: it.quantity ?? 0,
          unitPrice: it.unitPrice ?? 0,
          volume: it.volume ?? null,
          netWeight: it.netWeight ?? null,
          grossWeight: it.grossWeight ?? null,
          packages: it.packages ?? null,
        })),
      )
    }
  }

  const selectedBank = useMemo(
    () => banks.find((b) => String(b.id) === bankId),
    [banks, bankId],
  )

  const totals = useMemo(() => {
    let amount = 0
    let net = 0
    let gross = 0
    let volume = 0
    let pkgs = 0
    for (const it of items) {
      amount += (it.quantity || 0) * (it.unitPrice || 0)
      net += it.netWeight || 0
      gross += it.grossWeight || 0
      volume += it.volume || 0
      pkgs += it.packages || 0
    }
    return { amount, net, gross, volume, pkgs }
  }, [items])

  function updateItem(key: string, patch: Partial<ItemRow>) {
    setItems((prev) =>
      prev.map((it) => (it._key === key ? { ...it, ...patch } : it)),
    )
  }

  function applyProduct(key: string, productId: string) {
    const p = products.find((x) => String(x.id) === productId)
    if (!p) {
      updateItem(key, { productId: null })
      return
    }
    updateItem(key, {
      productId: p.id,
      code: p.code ?? "",
      description: p.description,
      ncm: p.ncm ?? "",
      unit: p.unit ?? "",
      unitPrice: p.unitPrice ? Number(p.unitPrice) : 0,
      netWeight: p.netWeight ? Number(p.netWeight) : null,
      grossWeight: p.grossWeight ? Number(p.grossWeight) : null,
    })
  }

  function submit() {
    if (!poNumber.trim()) {
      toast.error("Informe o número do PO.")
      return
    }
    const validItems = items.filter((it) => it.description.trim())
    if (validItems.length === 0) {
      toast.error("Adicione ao menos um item com descrição.")
      return
    }

    startTransition(async () => {
      const res = await createPurchaseOrder({
        poNumber,
        pfiNumber: pfiNumber || null,
        invoiceNumber: invoiceNumber || null,
        issueDate: issueDate || null,
        clientId: selectedClient?.id ?? null,
        clientName: selectedClient?.name ?? (importedClientName || null),
        clientSnapshot: selectedClient ?? null,
        notifyParty: notifyParty || null,
        incoterm,
        currency,
        portOfLoading: portOfLoading || null,
        portOfDischarge: portOfDischarge || null,
        finalDestination: finalDestination || null,
        countryOfDestination: countryOfDestination || null,
        vessel: vessel || null,
        paymentTerms: paymentTerms || null,
        bankId: selectedBank?.id ?? null,
        bankInfo: selectedBank
          ? {
              label: selectedBank.label,
              broker: selectedBank.broker,
              beneficiaryBank: selectedBank.beneficiaryBank,
              bankCity: selectedBank.bankCity,
              swift: selectedBank.swift,
              agency: selectedBank.agency,
              beneficiaryName: selectedBank.beneficiaryName,
              accountIban: selectedBank.accountIban,
              intermediaryBank: selectedBank.intermediaryBank,
              intermediarySwift: selectedBank.intermediarySwift,
            }
          : null,
        notes: notes || null,
        items: validItems.map((it) => ({
          productId: it.productId,
          code: it.code,
          description: it.description,
          ncm: it.ncm,
          unit: it.unit,
          quantity: Number(it.quantity) || 0,
          unitPrice: Number(it.unitPrice) || 0,
          volume: it.volume != null ? Number(it.volume) : null,
          netWeight: it.netWeight != null ? Number(it.netWeight) : null,
          grossWeight: it.grossWeight != null ? Number(it.grossWeight) : null,
          packages: it.packages != null ? Number(it.packages) : null,
        })),
      })
      if (res.ok) {
        toast.success("PO criado com sucesso.")
        router.push(`/pos/${res.id}`)
        router.refresh()
      } else {
        toast.error("Erro ao salvar o PO.")
      }
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Recebeu o PO por e-mail?
          </p>
          <p className="text-sm text-muted-foreground">
            Importe o PDF e os campos serão preenchidos automaticamente para revisão.
          </p>
        </div>
        <PoImportDialog onParsed={applyParsed} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Número do PO *">
            <Input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} placeholder="21908" />
          </Field>
          <Field label="Proforma (PFI)">
            <Input value={pfiNumber} onChange={(e) => setPfiNumber(e.target.value)} placeholder="2812" />
          </Field>
          <Field label="Invoice">
            <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="SEN-1169/26" />
          </Field>
          <Field label="Data de emissão">
            <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </Field>
          <Field label="Cliente">
            <Select value={clientId} onValueChange={(v) => setClientId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Nenhum cliente importado
                  </SelectItem>
                ) : (
                  clients.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {importedClientName && !selectedClient ? (
              <p className="mt-1.5 text-xs text-accent">
                Importado: {importedClientName} (não encontrado na base — será salvo como texto)
              </p>
            ) : null}
          </Field>
          <Field label="Moeda">
            <Select value={currency} onValueChange={(v) => setCurrency(v ?? "USD")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="BRL">BRL</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logística & Embarque</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Incoterm">
            <Select value={incoterm} onValueChange={(v) => setIncoterm(v ?? "FOB")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["FOB", "CFR", "CIF", "EXW", "FCA"].map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Porto de embarque">
            <Input value={portOfLoading} onChange={(e) => setPortOfLoading(e.target.value)} placeholder="Paranaguá - PR" />
          </Field>
          <Field label="Porto de destino">
            <Input value={portOfDischarge} onChange={(e) => setPortOfDischarge(e.target.value)} placeholder="Jacksonville, FL" />
          </Field>
          <Field label="Destino final">
            <Input value={finalDestination} onChange={(e) => setFinalDestination(e.target.value)} />
          </Field>
          <Field label="País de destino">
            <Input value={countryOfDestination} onChange={(e) => setCountryOfDestination(e.target.value)} placeholder="USA" />
          </Field>
          <Field label="Navio / Vessel">
            <Input value={vessel} onChange={(e) => setVessel(e.target.value)} />
          </Field>
          <Field label="Condições de pagamento">
            <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="100% T/T in advance" />
          </Field>
          <Field label="Notify party (adicional)">
            <Input value={notifyParty} onChange={(e) => setNotifyParty(e.target.value)} placeholder="International Forest Products LLC..." />
          </Field>
          <Field label="Canal bancário (Payment Instruction)">
            <Select value={bankId} onValueChange={(v) => setBankId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um banco" />
              </SelectTrigger>
              <SelectContent>
                {banks.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Nenhum banco cadastrado
                  </SelectItem>
                ) : (
                  banks.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.label}
                      {b.isDefault ? " (padrão)" : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Itens</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setItems((p) => [...p, emptyItem()])}
          >
            <Plus className="h-4 w-4" />
            Adicionar item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((it, idx) => (
            <div
              key={it._key}
              className="rounded-lg border border-border p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Item {idx + 1}
                </span>
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setItems((p) => p.filter((x) => x._key !== it._key))
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-2">
                  <Label className="mb-1.5 block text-xs">Produto (Omie)</Label>
                  <Select
                    value={it.productId ? String(it.productId) : ""}
                    onValueChange={(v) => applyProduct(it._key, v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar ou preencher manual" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhum produto importado
                        </SelectItem>
                      ) : (
                        products.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.code ? `${p.code} · ` : ""}
                            {p.description}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <NumField label="NCM" text value={it.ncm ?? ""} onChange={(v) => updateItem(it._key, { ncm: v })} />
                <NumField label="Unidade" text value={it.unit ?? ""} onChange={(v) => updateItem(it._key, { unit: v })} />
                <div className="lg:col-span-4">
                  <Label className="mb-1.5 block text-xs">Descrição</Label>
                  <Input
                    value={it.description}
                    onChange={(e) => updateItem(it._key, { description: e.target.value })}
                    placeholder="Descrição da mercadoria"
                  />
                </div>
                <NumField label="Quantidade" value={it.quantity} onChange={(v) => updateItem(it._key, { quantity: Number(v) || 0 })} />
                <NumField label={`Preço unit. (${currency})`} value={it.unitPrice} onChange={(v) => updateItem(it._key, { unitPrice: Number(v) || 0 })} />
                <NumField label="Volume (m³)" value={it.volume ?? ""} onChange={(v) => updateItem(it._key, { volume: v === "" ? null : Number(v) })} />
                <NumField label="Pacotes" value={it.packages ?? ""} onChange={(v) => updateItem(it._key, { packages: v === "" ? null : Number(v) })} />
                <NumField label="Peso líq. (kg)" value={it.netWeight ?? ""} onChange={(v) => updateItem(it._key, { netWeight: v === "" ? null : Number(v) })} />
                <NumField label="Peso bruto (kg)" value={it.grossWeight ?? ""} onChange={(v) => updateItem(it._key, { grossWeight: v === "" ? null : Number(v) })} />
                <div className="flex items-end">
                  <p className="text-sm font-medium tabular-nums">
                    {formatCurrency((it.quantity || 0) * (it.unitPrice || 0), currency)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
            <Total label="Pacotes" value={String(totals.pkgs)} />
            <Total label="Volume (m³)" value={totals.volume.toFixed(3)} />
            <Total label="Peso líq. (kg)" value={totals.net.toFixed(2)} />
            <Total label="Peso bruto (kg)" value={totals.gross.toFixed(2)} />
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(totals.amount, currency)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notas internas ou observações para os documentos" />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/")} disabled={pending}>
          Cancelar
        </Button>
        <Button onClick={submit} disabled={pending}>
          {pending ? "Salvando..." : "Salvar PO"}
        </Button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      {children}
    </div>
  )
}

function NumField({
  label,
  value,
  onChange,
  text,
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  text?: boolean
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <Input
        type={text ? "text" : "number"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums">{value}</p>
    </div>
  )
}
