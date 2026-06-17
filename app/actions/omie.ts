"use server"

import { db } from "@/lib/db"
import { clients, products } from "@/lib/db/schema"
import { listOmieClients, listOmieProducts, OmieError } from "@/lib/omie"
import { sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getClients(search?: string, page = 1, perPage = 50) {
  const offset = (page - 1) * perPage
  if (search) {
    const term = `%${search.toLowerCase()}%`
    const items = await db
      .select()
      .from(clients)
      .where(sql`lower(${clients.name}) like ${term} or lower(coalesce(${clients.document}, '')) like ${term}`)
      .orderBy(clients.name)
      .limit(perPage)
      .offset(offset)
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(sql`lower(${clients.name}) like ${term} or lower(coalesce(${clients.document}, '')) like ${term}`)
    return { items, total: Number(count) }
  }
  const items = await db.select().from(clients).orderBy(clients.name).limit(perPage).offset(offset)
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(clients)
  return { items, total: Number(count) }
}

      // Insercao em lote, com chunks para nao estourar limite de parametros
      const chunkSize = 200
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize)
        if (chunk.length === 0) continue
        await db
          .insert(clients)
          .values(chunk)
          .onConflictDoUpdate({
            target: clients.omieId,
            set: {
              name: sql`excluded.name`,
              fantasyName: sql`excluded.fantasy_name`,
              document: sql`excluded.document`,
              email: sql`excluded.email`,
              phone: sql`excluded.phone`,
              address: sql`excluded.address`,
              addressNumber: sql`excluded.address_number`,
              complement: sql`excluded.complement`,
              district: sql`excluded.district`,
              city: sql`excluded.city`,
              state: sql`excluded.state`,
              zipCode: sql`excluded.zip_code`,
              country: sql`excluded.country`,
              contactName: sql`excluded.contact_name`,
              raw: sql`excluded.raw`,
              syncedAt: sql`excluded.synced_at`,
            },
          })
        count += chunk.length
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
    const now = new Date()

    do {
      const { items, totalPages: tp } = await listOmieProducts(page, 500)
      totalPages = tp || 1

      const rows = items.map((p) => ({
        omieId: String(p.codigo_produto),
        code: p.codigo ?? null,
        description: p.descricao,
        ncm: p.ncm ?? null,
        unit: p.unidade ?? null,
        unitPrice: p.valor_unitario != null ? String(p.valor_unitario) : null,
        netWeight: p.peso_liq != null ? String(p.peso_liq) : null,
        grossWeight: p.peso_bruto != null ? String(p.peso_bruto) : null,
        raw: p,
        syncedAt: now,
      }))

      const chunkSize = 200
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize)
        if (chunk.length === 0) continue
        await db
          .insert(products)
          .values(chunk)
          .onConflictDoUpdate({
            target: products.omieId,
            set: {
              code: sql`excluded.code`,
              description: sql`excluded.description`,
              ncm: sql`excluded.ncm`,
              unit: sql`excluded.unit`,
              unitPrice: sql`excluded.unit_price`,
              netWeight: sql`excluded.net_weight`,
              grossWeight: sql`excluded.gross_weight`,
              raw: sql`excluded.raw`,
              syncedAt: sql`excluded.synced_at`,
            },
          })
        count += chunk.length
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
