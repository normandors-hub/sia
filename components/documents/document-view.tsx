import type { PoItem, PurchaseOrder } from "@/lib/db/schema"
import { DOC_TYPES, formatCurrency, formatDateLong, formatNumber } from "@/lib/format"
import type { DocType } from "@/lib/format"
import { DocFooter, DocHeader, DocSection, DocSheet } from "./doc-shell"

type PoWithItems = PurchaseOrder & { items: PoItem[] }

function num(v: string | number | null | undefined) {
  return v != null ? Number(v) : 0
}

function ClientBlock({ po }: { po: PoWithItems }) {
  const snap = (po.clientSnapshot ?? {}) as Record<string, string | null>
  const lines = [
    po.clientName,
    [snap.address, snap.addressNumber].filter(Boolean).join(", "),
    [snap.district, snap.city, snap.state].filter(Boolean).join(" - "),
    [snap.country, snap.zipCode].filter(Boolean).join(" "),
    snap.document ? `Doc: ${snap.document}` : null,
  ].filter(Boolean)
  return (
    <div className="space-y-0.5">
      {lines.map((l, i) => (
        <p key={i} className={i === 0 ? "font-semibold" : ""}>
          {l}
        </p>
      ))}
    </div>
  )
}

function ShipmentGrid({ po }: { po: PoWithItems }) {
  const fields: [string, string | null][] = [
    ["Incoterm", po.incoterm],
    ["Porto de embarque", po.portOfLoading],
    ["Porto de destino", po.portOfDischarge],
    ["Destino final", po.finalDestination],
    ["País de origem", po.countryOfOrigin],
    ["País de destino", po.countryOfDestination],
    ["Navio / Vessel", po.vessel],
    ["Condições de pagamento", po.paymentTerms],
  ]
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
      {fields
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <p key={k}>
            <span className="text-neutral-500">{k}: </span>
            {v}
          </p>
        ))}
    </div>
  )
}

function ItemsTable({
  po,
  showWeights,
}: {
  po: PoWithItems
  showWeights?: boolean
}) {
  const currency = po.currency ?? "USD"
  return (
    <table className="w-full border-collapse text-[10px]">
      <thead>
        <tr className="border-b border-neutral-400 text-left">
          <th className="py-1 pr-2">#</th>
          <th className="py-1 pr-2">Descrição</th>
          <th className="py-1 pr-2">NCM</th>
          <th className="py-1 pr-2 text-right">Qtd</th>
          <th className="py-1 pr-2">Un.</th>
          {showWeights ? (
            <>
              <th className="py-1 pr-2 text-right">Pacotes</th>
              <th className="py-1 pr-2 text-right">Vol. m³</th>
              <th className="py-1 pr-2 text-right">P. Líq</th>
              <th className="py-1 pr-2 text-right">P. Bruto</th>
            </>
          ) : (
            <>
              <th className="py-1 pr-2 text-right">Preço Un.</th>
              <th className="py-1 text-right">Total</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {po.items.map((it) => (
          <tr key={it.id} className="border-b border-neutral-200 align-top">
            <td className="py-1 pr-2">{it.lineNo}</td>
            <td className="py-1 pr-2">
              {it.code ? <span className="text-neutral-500">{it.code} · </span> : null}
              {it.description}
            </td>
            <td className="py-1 pr-2">{it.ncm ?? "-"}</td>
            <td className="py-1 pr-2 text-right tabular-nums">
              {formatNumber(it.quantity)}
            </td>
            <td className="py-1 pr-2">{it.unit ?? "-"}</td>
            {showWeights ? (
              <>
                <td className="py-1 pr-2 text-right tabular-nums">{it.packages ?? "-"}</td>
                <td className="py-1 pr-2 text-right tabular-nums">{it.volume ? formatNumber(it.volume) : "-"}</td>
                <td className="py-1 pr-2 text-right tabular-nums">{it.netWeight ? formatNumber(it.netWeight, 2) : "-"}</td>
                <td className="py-1 pr-2 text-right tabular-nums">{it.grossWeight ? formatNumber(it.grossWeight, 2) : "-"}</td>
              </>
            ) : (
              <>
                <td className="py-1 pr-2 text-right tabular-nums">{formatCurrency(it.unitPrice, currency)}</td>
                <td className="py-1 text-right tabular-nums">{formatCurrency(num(it.amount), currency)}</td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Totals({ po }: { po: PoWithItems }) {
  const currency = po.currency ?? "USD"
  return (
    <div className="mt-3 flex justify-end">
      <div className="w-56 space-y-1">
        <div className="flex justify-between border-t border-neutral-400 pt-1 text-[12px] font-bold">
          <span>TOTAL {currency}</span>
          <span className="tabular-nums">{formatCurrency(po.totalAmount, currency)}</span>
        </div>
      </div>
    </div>
  )
}

function WeightSummary({ po }: { po: PoWithItems }) {
  return (
    <div className="mt-3 grid grid-cols-4 gap-3 border-t border-neutral-400 pt-2 text-[10px]">
      <p><span className="text-neutral-500">Total pacotes: </span>{po.totalPackages ?? "-"}</p>
      <p><span className="text-neutral-500">Volume total: </span>{formatNumber(po.totalVolume)} m³</p>
      <p><span className="text-neutral-500">Peso líquido: </span>{formatNumber(po.totalNetWeight, 2)} kg</p>
      <p><span className="text-neutral-500">Peso bruto: </span>{formatNumber(po.totalGrossWeight, 2)} kg</p>
    </div>
  )
}

function BankBlock({ po }: { po: PoWithItems }) {
  const bank = (po.bankInfo ?? {}) as Record<string, string>
  const entries = Object.entries(bank)
  if (entries.length === 0) {
    return (
      <div className="space-y-0.5 text-neutral-700">
        <p className="font-semibold">SENBRA EXPORT — Banking details</p>
        <p>Beneficiary: Senbra Export Ltda.</p>
        <p>Bank / SWIFT / IBAN / Account: a configurar nas observações do PO</p>
      </div>
    )
  }
  return (
    <div className="space-y-0.5">
      {entries.map(([k, v]) => (
        <p key={k}>
          <span className="text-neutral-500">{k}: </span>
          {v}
        </p>
      ))}
    </div>
  )
}

export function DocumentView({
  po,
  docType,
}: {
  po: PoWithItems
  docType: DocType
}) {
  const currency = po.currency ?? "USD"
  const refLine = `PO ${po.poNumber}${po.pfiNumber ? ` · PFI ${po.pfiNumber}` : ""}${po.invoiceNumber ? ` · INV ${po.invoiceNumber}` : ""}`

  return (
    <DocSheet>
      <DocHeader title={DOC_TYPES[docType]} subtitle={refLine} />

      <div className="mb-4 grid grid-cols-2 gap-6">
        <DocSection title="Sold To / Buyer">
          <ClientBlock po={po} />
        </DocSection>
        <DocSection title="Referências">
          <div className="space-y-0.5">
            <p><span className="text-neutral-500">Data: </span>{formatDateLong(po.issueDate)}</p>
            <p><span className="text-neutral-500">PO: </span>{po.poNumber}</p>
            {po.pfiNumber ? <p><span className="text-neutral-500">PFI: </span>{po.pfiNumber}</p> : null}
            {po.invoiceNumber ? <p><span className="text-neutral-500">Invoice: </span>{po.invoiceNumber}</p> : null}
          </div>
        </DocSection>
      </div>

      {(docType === "invoice" || docType === "pfi") && (
        <>
          <DocSection title="Shipment">
            <ShipmentGrid po={po} />
          </DocSection>
          <ItemsTable po={po} />
          <Totals po={po} />
          {po.notes ? (
            <DocSection title="Observações">
              <p className="whitespace-pre-line">{po.notes}</p>
            </DocSection>
          ) : null}
          {docType === "pfi" ? (
            <p className="mt-4 text-[10px] text-neutral-600">
              This Proforma Invoice is valid for acceptance and does not constitute a
              fiscal document.
            </p>
          ) : null}
        </>
      )}

      {docType === "packing_list" && (
        <>
          <DocSection title="Shipment">
            <ShipmentGrid po={po} />
          </DocSection>
          <ItemsTable po={po} showWeights />
          <WeightSummary po={po} />
        </>
      )}

      {docType === "credit_note" && (
        <>
          <DocSection title="Shipment">
            <ShipmentGrid po={po} />
          </DocSection>
          <p className="mb-3">
            We hereby issue this Credit Note in favor of the buyer referencing the
            documents above.
          </p>
          <ItemsTable po={po} />
          <Totals po={po} />
          <p className="mt-4 text-[10px] text-neutral-600">
            Total credit amount: {formatCurrency(po.totalAmount, currency)}.
          </p>
        </>
      )}

      {docType === "payment_instruction" && (
        <>
          <p className="mb-3">
            Please find below the banking instructions for the payment related to{" "}
            {refLine}. Payment terms: {po.paymentTerms ?? "as agreed"}.
          </p>
          <DocSection title="Banking Details">
            <BankBlock po={po} />
          </DocSection>
          <DocSection title="Amount Due">
            <p className="text-[14px] font-bold tabular-nums">
              {formatCurrency(po.totalAmount, currency)}
            </p>
          </DocSection>
          {po.notes ? (
            <DocSection title="Observações">
              <p className="whitespace-pre-line">{po.notes}</p>
            </DocSection>
          ) : null}
        </>
      )}

      {docType === "warehouse_letter" && (
        <>
          <p className="mb-2">To whom it may concern,</p>
          <p className="mb-3 leading-relaxed">
            We hereby declare that the goods described below, related to {refLine},
            are ready and stored at our warehouse for shipment to{" "}
            {po.portOfDischarge ?? po.finalDestination ?? "the destination port"}.
          </p>
          <ItemsTable po={po} showWeights />
          <WeightSummary po={po} />
          <p className="mt-6">Yours faithfully,</p>
          <p className="mt-8 border-t border-neutral-400 pt-1 text-[10px] text-neutral-600">
            SENBRA EXPORT — Authorized signature
          </p>
        </>
      )}

      <DocFooter />
    </DocSheet>
  )
}
