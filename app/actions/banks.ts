"use server"

import { db } from "@/lib/db"
import { banks } from "@/lib/db/schema"
import { desc, eq, ne } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export interface BankInput {
  label: string
  broker?: string | null
  beneficiaryBank?: string | null
  bankCity?: string | null
  swift?: string | null
  agency?: string | null
  beneficiaryName?: string | null
  accountIban?: string | null
  intermediaryBank?: string | null
  intermediarySwift?: string | null
  isDefault?: boolean
  notes?: string | null
}

export async function getBanks() {
  return db.select().from(banks).orderBy(desc(banks.isDefault), banks.label)
}

export async function createBank(input: BankInput) {
  const [bank] = await db
    .insert(banks)
    .values({
      label: input.label,
      broker: input.broker ?? null,
      beneficiaryBank: input.beneficiaryBank ?? null,
      bankCity: input.bankCity ?? null,
      swift: input.swift ?? null,
      agency: input.agency ?? null,
      beneficiaryName: input.beneficiaryName ?? null,
      accountIban: input.accountIban ?? null,
      intermediaryBank: input.intermediaryBank ?? null,
      intermediarySwift: input.intermediarySwift ?? null,
      isDefault: input.isDefault ?? false,
      notes: input.notes ?? null,
    })
    .returning()

  if (input.isDefault) {
    await db.update(banks).set({ isDefault: false }).where(ne(banks.id, bank.id))
  }
  revalidatePath("/bancos")
  return { ok: true, id: bank.id }
}

export async function updateBank(id: number, input: BankInput) {
  await db
    .update(banks)
    .set({
      label: input.label,
      broker: input.broker ?? null,
      beneficiaryBank: input.beneficiaryBank ?? null,
      bankCity: input.bankCity ?? null,
      swift: input.swift ?? null,
      agency: input.agency ?? null,
      beneficiaryName: input.beneficiaryName ?? null,
      accountIban: input.accountIban ?? null,
      intermediaryBank: input.intermediaryBank ?? null,
      intermediarySwift: input.intermediarySwift ?? null,
      isDefault: input.isDefault ?? false,
      notes: input.notes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(banks.id, id))

  if (input.isDefault) {
    await db.update(banks).set({ isDefault: false }).where(ne(banks.id, id))
  }
  revalidatePath("/bancos")
  return { ok: true }
}

export async function deleteBank(id: number) {
  await db.delete(banks).where(eq(banks.id, id))
  revalidatePath("/bancos")
  return { ok: true }
}
