"use server"

import { db } from "@/lib/db"
import { poItems, purchaseOrders } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export interface PoItemInput {
  productId?: number | null
  code?: string | null
  description: string
  ncm?: string | null
  unit?: string | null
  quantity: number
  unitPrice: number
  volume?: number | null
  netWeight?: number | null
  grossWeight?: number | null
  packages?: number | null
}

export interface PoInput {
  poNumber: string
  pfiNumber?: string | null
  invoiceNumber?: string | null
  issueDate?: string | null
  clientId?: number | null
  clientName?: string | null
  clientSnapshot?: unknown
  notifyParty?: unknown
  incoterm?: string | null
  currency?: string | null
  portOfLoading?: string | null
  portOfDischarge?: string | null
  finalDestination?: string | null
  countryOfOrigin?: string | null
  countryOfDestination?: string | null
  vessel?: string | null
  paymentTerms?: string | null
  bankId?: number | null
  bankInfo?: unknown
  notes?: string | null
  items: PoItemInput[]
}

function num(v: number | null | undefined) {
  return v != null ? String(v) : null
}

function computeTotals(items: PoItemInput[]) {
  let totalPackages = 0
  let totalVolume = 0
  let totalNet = 0
  let totalGross = 0
  let totalAmount = 0
  for (const it of items) {
    totalPackages += it.packages ?? 0
    totalVolume += it.volume ?? 0
    totalNet += it.netWeight ?? 0
    totalGross += it.grossWeight ?? 0
    totalAmount += (it.quantity ?? 0) * (it.unitPrice ?? 0)
  }
  return { totalPackages, totalVolume, totalNet, totalGross, totalAmount }
}

export async function createPurchaseOrder(input: PoInput) {
  const totals = computeTotals(input.items)

  const [po] = await db
    .insert(purchaseOrders)
    .values({
      poNumber: input.poNumber,
      pfiNumber: input.pfiNumber ?? null,
      invoiceNumber: input.invoiceNumber ?? null,
      issueDate: input.issueDate ?? null,
      clientId: input.clientId ?? null,
      clientName: input.clientName ?? null,
      clientSnapshot: input.clientSnapshot ?? null,
      notifyParty: input.notifyParty ?? null,
      incoterm: input.incoterm ?? "FOB",
      currency: input.currency ?? "USD",
      portOfLoading: input.portOfLoading ?? null,
      portOfDischarge: input.portOfDischarge ?? null,
      finalDestination: input.finalDestination ?? null,
      countryOfOrigin: input.countryOfOrigin ?? "BRAZIL",
      countryOfDestination: input.countryOfDestination ?? null,
      vessel: input.vessel ?? null,
      paymentTerms: input.paymentTerms ?? null,
      bankId: input.bankId ?? null,
      bankInfo: input.bankInfo ?? null,
      notes: input.notes ?? null,
      totalPackages: totals.totalPackages,
      totalVolume: num(totals.totalVolume),
      totalNetWeight: num(totals.totalNet),
      totalGrossWeight: num(totals.totalGross),
      totalAmount: num(totals.totalAmount),
    })
    .returning()

  if (input.items.length) {
    await db.insert(poItems).values(
      input.items.map((it, idx) => ({
        poId: po.id,
        productId: it.productId ?? null,
        lineNo: idx + 1,
        code: it.code ?? null,
        description: it.description,
        ncm: it.ncm ?? null,
        unit: it.unit ?? null,
        quantity: num(it.quantity) ?? "0",
        unitPrice: num(it.unitPrice) ?? "0",
        volume: num(it.volume),
        netWeight: num(it.netWeight),
        grossWeight: num(it.grossWeight),
        packages: it.packages ?? null,
        amount: num((it.quantity ?? 0) * (it.unitPrice ?? 0)),
      })),
    )
  }

  revalidatePath("/")
  return { ok: true, id: po.id }
}

export async function getPurchaseOrders() {
  return db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt))
}

export async function getPurchaseOrder(id: number) {
  const [po] = await db
    .select()
    .from(purchaseOrders)
    .where(eq(purchaseOrders.id, id))
  if (!po) return null
  const items = await db
    .select()
    .from(poItems)
    .where(eq(poItems.poId, id))
    .orderBy(poItems.lineNo)
  return { ...po, items }
}

export async function updatePoStatus(id: number, status: string) {
  await db
    .update(purchaseOrders)
    .set({ status, updatedAt: new Date() })
    .where(eq(purchaseOrders.id, id))
  revalidatePath("/")
  revalidatePath(`/pos/${id}`)
  return { ok: true }
}

export async function deletePurchaseOrder(id: number) {
  await db.delete(poItems).where(eq(poItems.poId, id))
  await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id))
  revalidatePath("/")
  return { ok: true }
}

export async function getPoItemsFor(poId: number) {
  return db
    .select()
    .from(poItems)
    .where(and(eq(poItems.poId, poId)))
    .orderBy(poItems.lineNo)
}
