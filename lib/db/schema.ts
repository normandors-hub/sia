import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  jsonb,
  timestamp,
  date,
  boolean,
} from "drizzle-orm/pg-core"

export const banks = pgTable("banks", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  broker: text("broker"),
  beneficiaryBank: text("beneficiary_bank"),
  bankCity: text("bank_city"),
  swift: text("swift"),
  agency: text("agency"),
  beneficiaryName: text("beneficiary_name"),
  accountIban: text("account_iban"),
  intermediaryBank: text("intermediary_bank"),
  intermediarySwift: text("intermediary_swift"),
  isDefault: boolean("is_default").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  omieId: text("omie_id").unique(),
  code: text("code"),
  name: text("name").notNull(),
  fantasyName: text("fantasy_name"),
  document: text("document"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  addressNumber: text("address_number"),
  complement: text("complement"),
  district: text("district"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  contactName: text("contact_name"),
  raw: jsonb("raw"),
  syncedAt: timestamp("synced_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  omieId: text("omie_id").unique(),
  code: text("code"),
  description: text("description").notNull(),
  ncm: text("ncm"),
  unit: text("unit"),
  unitPrice: numeric("unit_price"),
  currency: text("currency").default("USD"),
  netWeight: numeric("net_weight"),
  grossWeight: numeric("gross_weight"),
  raw: jsonb("raw"),
  syncedAt: timestamp("synced_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: text("po_number").notNull(),
  pfiNumber: text("pfi_number"),
  invoiceNumber: text("invoice_number"),
  status: text("status").notNull().default("draft"),
  issueDate: date("issue_date"),
  clientId: integer("client_id"),
  clientName: text("client_name"),
  clientSnapshot: jsonb("client_snapshot"),
  notifyParty: jsonb("notify_party"),
  incoterm: text("incoterm").default("FOB"),
  currency: text("currency").default("USD"),
  portOfLoading: text("port_of_loading"),
  portOfDischarge: text("port_of_discharge"),
  finalDestination: text("final_destination"),
  countryOfOrigin: text("country_of_origin").default("BRAZIL"),
  countryOfDestination: text("country_of_destination"),
  vessel: text("vessel"),
  paymentTerms: text("payment_terms"),
  bankId: integer("bank_id"),
  bankInfo: jsonb("bank_info"),
  totalPackages: integer("total_packages"),
  totalVolume: numeric("total_volume"),
  totalNetWeight: numeric("total_net_weight"),
  totalGrossWeight: numeric("total_gross_weight"),
  totalAmount: numeric("total_amount"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const poItems = pgTable("po_items", {
  id: serial("id").primaryKey(),
  poId: integer("po_id").notNull(),
  productId: integer("product_id"),
  lineNo: integer("line_no"),
  code: text("code"),
  description: text("description").notNull(),
  ncm: text("ncm"),
  unit: text("unit"),
  quantity: numeric("quantity").notNull().default("0"),
  unitPrice: numeric("unit_price").notNull().default("0"),
  volume: numeric("volume"),
  netWeight: numeric("net_weight"),
  grossWeight: numeric("gross_weight"),
  packages: integer("packages"),
  amount: numeric("amount"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  poId: integer("po_id").notNull(),
  docType: text("doc_type").notNull(),
  docNumber: text("doc_number"),
  issueDate: date("issue_date"),
  data: jsonb("data"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Bank = typeof banks.$inferSelect
export type Client = typeof clients.$inferSelect
export type Product = typeof products.$inferSelect
export type PurchaseOrder = typeof purchaseOrders.$inferSelect
export type PoItem = typeof poItems.$inferSelect
export type DocumentRow = typeof documents.$inferSelect
