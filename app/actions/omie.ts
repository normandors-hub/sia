"use server"

import { db } from "@/lib/db"
import { clients, products } from "@/lib/db/schema"
import { listOmieClients, listOmieProducts, OmieError } from "@/lib/omie"
import { sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function syncOmieClients() {
  try {
    let page = 1
    let totalPages = 1
    let count = 0

    do {
      const { items, totalPages: tp } = await listOmieClients(page, 50)
      totalPages = tp || 1

      for (const c of items) {
        const phone =
          c.telefone1_ddd || c.telefone1_numero
            ? `${c.telefone1_ddd ?? ""} ${c.telefone1_numero ?? ""}`.trim()
            : null

        await db
          .insert(clients)
          .values({
            omieId: String(c.codigo_cliente_omie),
            code: c.codigo_cliente_integracao ?? null,
            name: c.razao_social,
            fantasyName: c.nome_fantasia ?? null,
            document: c.cnpj_cpf ?? null,
            email: c.email ?? null,
            phone,
            address: c.endereco ?? null,
            addressNumber: c.endereco_numero ?? null,
            complement: c.complemento ?? null,
            district: c.bairro ?? null,
            city: c.cidade ?? null,
            state: c.estado ?? null,
            zipCode: c.cep ?? null,
            country: c.pais ?? null,
            contactName: c.contato ?? null,
            raw: c,
            syncedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: clients.omieId,
            set: {
              name: c.razao_social,
              fantasyName: c.nome_fantasia ?? null,
              document: c.cnpj_cpf ?? null,
              email: c.email ?? null,
              phone,
              address: c.endereco ?? null,
              addressNumber: c.endereco_numero ?? null,
              complement: c.complemento ?? null,
              district: c.bairro ?? null,
              city: c.cidade ?? null,
              state: c.estado ?? null,
              zipCode: c.cep ?? null,
              country: c.pais ?? null,
              contactName: c.contato ?? null,
              raw: c,
              syncedAt: new Date(),
            },
          })
        count++
      }
      page++
    } while (page <= totalPages)

    revalidatePath("/clientes")
    return { ok: true, count }
  } catch (e) {
    const message =
      e instanceof OmieError ? e.message : "Erro ao sincronizar clientes do Omie."
    return { ok: false, error: message }
  }
}

export async function syncOmieProducts() {
  try {
    let page = 1
    let totalPages = 1
    let count = 0

    do {
      const { items, totalPages: tp } = await listOmieProducts(page, 50)
      totalPages = tp || 1

      for (const p of items) {
        await db
          .insert(products)
          .values({
            omieId: String(p.codigo_produto),
            code: p.codigo ?? null,
            description: p.descricao,
            ncm: p.ncm ?? null,
            unit: p.unidade ?? null,
            unitPrice: p.valor_unitario != null ? String(p.valor_unitario) : null,
            netWeight: p.peso_liq != null ? String(p.peso_liq) : null,
            grossWeight: p.peso_bruto != null ? String(p.peso_bruto) : null,
            raw: p,
            syncedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: products.omieId,
            set: {
              code: p.codigo ?? null,
              description: p.descricao,
              ncm: p.ncm ?? null,
              unit: p.unidade ?? null,
              unitPrice: p.valor_unitario != null ? String(p.valor_unitario) : null,
              netWeight: p.peso_liq != null ? String(p.peso_liq) : null,
              grossWeight: p.peso_bruto != null ? String(p.peso_bruto) : null,
              raw: p,
              syncedAt: new Date(),
            },
          })
        count++
      }
      page++
    } while (page <= totalPages)

    revalidatePath("/produtos")
    return { ok: true, count }
  } catch (e) {
    const message =
      e instanceof OmieError ? e.message : "Erro ao sincronizar produtos do Omie."
    return { ok: false, error: message }
  }
}

export async function getClients(search?: string) {
  if (search) {
    const term = `%${search.toLowerCase()}%`
    return db
      .select()
      .from(clients)
      .where(sql`lower(${clients.name}) like ${term} or lower(coalesce(${clients.document}, '')) like ${term}`)
      .orderBy(clients.name)
      .limit(100)
  }
  return db.select().from(clients).orderBy(clients.name).limit(100)
}

export async function getProducts(search?: string) {
  if (search) {
    const term = `%${search.toLowerCase()}%`
    return db
      .select()
      .from(products)
      .where(sql`lower(${products.description}) like ${term} or lower(coalesce(${products.code}, '')) like ${term}`)
      .orderBy(products.description)
      .limit(100)
  }
  return db.select().from(products).orderBy(products.description).limit(100)
}
