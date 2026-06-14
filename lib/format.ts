export function formatCurrency(
  value: number | string | null | undefined,
  currency = "USD",
) {
  const n = typeof value === "string" ? Number(value) : (value ?? 0)
  if (Number.isNaN(n)) return "-"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n)
}

export function formatNumber(
  value: number | string | null | undefined,
  digits = 3,
) {
  const n = typeof value === "string" ? Number(value) : (value ?? 0)
  if (Number.isNaN(n)) return "-"
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(n)
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-"
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

export function formatDateLong(value: string | Date | null | undefined) {
  if (!value) return "-"
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d)
}

export const DOC_TYPES = {
  invoice: "Commercial Invoice",
  pfi: "Proforma Invoice",
  packing_list: "Packing List",
  credit_note: "Credit Note",
  payment_instruction: "Payment Instruction",
  warehouse_letter: "Warehouse Letter",
} as const

export type DocType = keyof typeof DOC_TYPES

export const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  confirmed: "Confirmado",
  shipped: "Embarcado",
  closed: "Concluído",
}
