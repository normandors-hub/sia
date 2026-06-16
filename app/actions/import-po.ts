"use server"

import { generateText, Output } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { extractText, getDocumentProxy } from "unpdf"
import { z } from "zod"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const itemSchema = z.object({
  code: z.string().nullable(),
  description: z.string(),
  ncm: z.string().nullable(),
  unit: z.string().nullable(),
  quantity: z.number(),
  unitPrice: z.number(),
  volume: z.number().nullable(),
  netWeight: z.number().nullable(),
  grossWeight: z.number().nullable(),
  packages: z.number().nullable(),
})

const poSchema = z.object({
  poNumber: z.string(),
  pfiNumber: z.string().nullable(),
  invoiceNumber: z.string().nullable(),
  issueDate: z.string().nullable(),
  clientName: z.string().nullable(),
  notifyParty: z.string().nullable(),
  incoterm: z.string().nullable(),
  currency: z.string().nullable(),
  portOfLoading: z.string().nullable(),
  portOfDischarge: z.string().nullable(),
  finalDestination: z.string().nullable(),
  countryOfDestination: z.string().nullable(),
  vessel: z.string().nullable(),
  paymentTerms: z.string().nullable(),
  notes: z.string().nullable(),
  items: z.array(itemSchema),
})

export type ParsedPo = z.infer<typeof poSchema>

export interface ImportResult {
  ok: boolean
  data?: ParsedPo
  fileName?: string
  error?: string
}

const SYSTEM_PROMPT = `Você é um especialista em comércio exterior que extrai dados de Pedidos de Compra (Purchase Orders) recebidos em PDF.
Receberá o texto bruto extraído de um PDF de Purchase Order e deve estruturá-lo no schema fornecido.

Regras importantes:
- "poNumber": o número do pedido (ex.: "Our Order No. 33934L" => "33934L"). Inclua o número de referência IFP em notes se existir.
- "clientName": o destinatário final da mercadoria (campo "SHIP TO" / consignee), NÃO o fornecedor/seller que aparece em "TO".
- "notifyParty": qualquer "Also notify" / notify party adicional, como texto.
- "incoterm": termo de entrega (ex.: "FAS Brazil Port" => "FAS", "FOB", "CFR", "CIF"). Apenas a sigla.
- "currency": moeda dos valores (ex.: "USD"). Não confundir com "PAYMENT TERMS" (ex.: "CAD" pode ser condição de pagamento "Cash Against Documents", não moeda — se os preços estão em USD, currency = "USD").
- "paymentTerms": condições de pagamento (ex.: "CAD", "100% T/T in advance").
- "issueDate": data do pedido (ORDER DATE) no formato ISO "YYYY-MM-DD".
- Itens: cada linha de produto. "quantity" é o volume numérico (ex.: "13.396 M3" => quantity 13.396, unit "M3"). "unitPrice" é o preço unitário numérico (ex.: "350.00/M3" => 350). "packages" é o número de bundles/pacotes. "description" deve conter a descrição completa do produto (ex.: "Pine Plywood C+C+ OES WBP 12mm 4 x 8"). Ignore linhas de total/subtotal.
- Use null para qualquer campo ausente. Nunca invente valores.
- Números devem ser números puros, sem separador de milhar nem símbolo de moeda.`

export async function importPoFromPdf(formData: FormData): Promise<ImportResult> {
  try {
    const file = formData.get("file")
    if (!file || !(file instanceof File)) {
      return { ok: false, error: "Nenhum arquivo enviado." }
    }

    const buffer = new Uint8Array(await file.arrayBuffer())
    const pdf = await getDocumentProxy(buffer)
    const { text } = await extractText(pdf, { mergePages: true })

    const rawText = Array.isArray(text) ? text.join("\n") : text
    if (!rawText || rawText.trim().length < 20) {
      return {
        ok: false,
        error:
          "Não foi possível extrair texto do PDF. O arquivo pode ser uma imagem escaneada.",
      }
    }

    const { experimental_output } = await generateText({
      model: openrouter("google/gemini-2.0-flash-001"),
      system: SYSTEM_PROMPT,
      prompt: `Texto extraído do PDF de Purchase Order:\n\n"""\n${rawText}\n"""\n\nExtraia os dados estruturados.`,
      experimental_output: Output.object({ schema: poSchema }),
    })

    return { ok: true, data: experimental_output, fileName: file.name }
  } catch (err) {
    console.error("[import-po] error:", err instanceof Error ? err.message : err)
    return {
      ok: false,
      error: "Erro ao processar o PDF. Tente novamente.",
    }
  }
}
