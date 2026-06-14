"use server"

import { db } from "@/lib/db"
import { banks } from "@/lib/db/schema"
import { asc, desc, eq, ne } from "drizzle-orm"
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
  try {
    return await db
      .select()
      .from(banks)
      .orderBy(desc(banks.isDefault), asc(banks.label))
  } catch (error) {
    console.error("Erro ao buscar bancos:", error)
    throw new Error("Não foi possível carregar os bancos.")
  }
}

export async function createBank(input: BankInput) {
  try {
    const bank = await db.transaction(async (tx) => {
      // Remove padrão dos demais bancos
      if (input.isDefault) {
        await tx.update(banks).set({
          isDefault: false,
          updatedAt: new Date(),
        })
      }

      const [newBank] = await tx
        .insert(banks)
        .values({
          label: input.label.trim(),
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

      return newBank
    })

    revalidatePath("/bancos")

    return {
      ok: true,
      id: bank.id,
    }
  } catch (error) {
    console.error("Erro ao criar banco:", error)

    return {
      ok: false,
      error: "Erro ao criar banco.",
    }
  }
}

export async function updateBank(
  id: number,
  input: BankInput
) {
  try {
    await db.transaction(async (tx) => {
      // Se este será o padrão, remove dos demais
      if (input.isDefault) {
        await tx
          .update(banks)
          .set({
            isDefault: false,
            updatedAt: new Date(),
          })
          .where(ne(banks.id, id))
      }

      await tx
        .update(banks)
        .set({
          label: input.label.trim(),
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
    })

    revalidatePath("/bancos")

    return {
      ok: true,
    }
  } catch (error) {
    console.error("Erro ao atualizar banco:", error)

    return {
      ok: false,
      error: "Erro ao atualizar banco.",
    }
  }
}

export async function deleteBank(id: number) {
  try {
    await db.delete(banks).where(eq(banks.id, id))

    revalidatePath("/bancos")

    return {
      ok: true,
    }
  } catch (error) {
    console.error("Erro ao excluir banco:", error)

    return {
      ok: false,
      error: "Erro ao excluir banco.",
    }
  }
}