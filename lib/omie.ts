// Cliente da API do Omie (https://developer.omie.com.br/service-list/)
// Todas as chamadas sao POST com { call, app_key, app_secret, param: [ {...} ] }

const OMIE_BASE = "https://app.omie.com.br/api/v1"

type OmieCallParams = Record<string, unknown>

export class OmieError extends Error {
  constructor(
    message: string,
    public readonly faultCode?: string,
  ) {
    super(message)
    this.name = "OmieError"
  }
}

function getCredentials() {
  const appKey = process.env.OMIE_APP_KEY
  const appSecret = process.env.OMIE_APP_SECRET
  if (!appKey || !appSecret) {
    throw new OmieError(
      "Credenciais do Omie nao configuradas (OMIE_APP_KEY / OMIE_APP_SECRET).",
    )
  }
  return { appKey, appSecret }
}

async function omieCall<T = unknown>(
  endpoint: string,
  call: string,
  param: OmieCallParams,
): Promise<T> {
  const { appKey, appSecret } = getCredentials()

  const res = await fetch(`${OMIE_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      call,
      app_key: appKey,
      app_secret: appSecret,
      param: [param],
    }),
    cache: "no-store",
  })

  const text = await res.text()
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new OmieError(`Resposta invalida do Omie: ${text.slice(0, 200)}`)
  }

  if (
    json &&
    typeof json === "object" &&
    "faultstring" in json &&
    (json as Record<string, unknown>).faultstring
  ) {
    const j = json as Record<string, string>
    throw new OmieError(j.faultstring, j.faultcode)
  }

  return json as T
}

// ---------- Clientes ----------

export interface OmieClienteResumo {
  codigo_cliente_omie: number
  codigo_cliente_integracao?: string
  razao_social: string
  nome_fantasia?: string
  cnpj_cpf?: string
  email?: string
  telefone1_ddd?: string
  telefone1_numero?: string
  endereco?: string
  endereco_numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  pais?: string
  contato?: string
}

interface ListarClientesResponse {
  pagina: number
  total_de_paginas: number
  registros: number
  total_de_registros: number
  clientes_cadastro?: OmieClienteResumo[]
}

export async function listOmieClients(pagina = 1, registrosPorPagina = 50) {
  const data = await omieCall<ListarClientesResponse>(
    "/geral/clientes/",
    "ListarClientes",
    {
      pagina,
      registros_por_pagina: registrosPorPagina,
      apenas_importado_api: "N",
    },
  )
  return {
    items: data.clientes_cadastro ?? [],
    page: data.pagina,
    totalPages: data.total_de_paginas,
    total: data.total_de_registros,
  }
}

// ---------- Produtos ----------

export interface OmieProdutoResumo {
  codigo_produto: number
  codigo?: string
  descricao: string
  ncm?: string
  unidade?: string
  valor_unitario?: number
  peso_liq?: number
  peso_bruto?: number
}

interface ListarProdutosResponse {
  pagina: number
  total_de_paginas: number
  registros: number
  total_de_registros: number
  produto_servico_cadastro?: OmieProdutoResumo[]
}

export async function listOmieProducts(pagina = 1, registrosPorPagina = 50) {
  const data = await omieCall<ListarProdutosResponse>(
    "/geral/produtos/",
    "ListarProdutos",
    {
      pagina,
      registros_por_pagina: registrosPorPagina,
      apenas_importado_api: "N",
      filtrar_apenas_omiepdv: "N",
    },
  )
  return {
    items: data.produto_servico_cadastro ?? [],
    page: data.pagina,
    totalPages: data.total_de_paginas,
    total: data.total_de_registros,
  }
}
