import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING

if (!connectionString) {
  throw new Error(
    "DATABASE_URL não está configurada. Verifique a integração Neon nas variáveis de ambiente do projeto.",
  )
}

const globalForDb = globalThis as unknown as {
  pool?: Pool
  poolConn?: string
}

// Recria o pool se a connection string mudar (evita pool em cache apontando para localhost)
if (!globalForDb.pool || globalForDb.poolConn !== connectionString) {
  globalForDb.pool?.end().catch(() => {})
  globalForDb.pool = new Pool({ connectionString })
  globalForDb.poolConn = connectionString
}

export const pool = globalForDb.pool

export const db = drizzle(pool, { schema })
