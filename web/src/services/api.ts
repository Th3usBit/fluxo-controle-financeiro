import type { Filtros, NovaTransacao, Resumo, Transacao } from '@/types/transacao'

import { apiLocal } from './api-local'

/**
 * Com NEXT_PUBLIC_MODO=local a interface dispensa o back-end e guarda os dados
 * no navegador. É assim que a versão do GitHub Pages funciona.
 */
export const MODO_LOCAL = process.env.NEXT_PUBLIC_MODO === 'local'

/** Endereço da API. Dá para apontar para outro host com NEXT_PUBLIC_API_URL. */
export const URL_DA_API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'

export interface DetalheDeErro {
  campo: string
  mensagem: string
}

/** Erro devolvido pela API (ou pela falta dela), já pronto para mostrar na tela. */
export class ErroDaApi extends Error {
  readonly status: number
  readonly detalhes: DetalheDeErro[]

  constructor(mensagem: string, status = 0, detalhes: DetalheDeErro[] = []) {
    super(mensagem)
    this.name = 'ErroDaApi'
    this.status = status
    this.detalhes = detalhes
  }

  /** Verdadeiro quando o servidor nem respondeu (API desligada, CORS, rede). */
  get offline(): boolean {
    return this.status === 0
  }
}

interface CorpoDeErro {
  erro?: {
    mensagem?: string
    detalhes?: DetalheDeErro[]
  }
}

const MENSAGEM_OFFLINE =
  'Não foi possível falar com a API. Confira se o servidor está rodando em ' + URL_DA_API

async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  let resposta: Response

  try {
    resposta = await fetch(`${URL_DA_API}${caminho}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        ...opcoes.headers,
      },
      cache: 'no-store',
    })
  } catch (erro) {
    // Requisição cancelada (filtro mudou no meio do caminho) não é erro de rede.
    if (erro instanceof DOMException && erro.name === 'AbortError') throw erro

    throw new ErroDaApi(MENSAGEM_OFFLINE)
  }

  if (resposta.status === 204) {
    return undefined as T
  }

  const texto = await resposta.text()
  const corpo: unknown = texto ? JSON.parse(texto) : null

  if (!resposta.ok) {
    const erro = (corpo as CorpoDeErro)?.erro

    throw new ErroDaApi(
      erro?.mensagem ?? 'Alguma coisa deu errado na API. Tente novamente.',
      resposta.status,
      erro?.detalhes ?? [],
    )
  }

  return corpo as T
}

/** Monta a query string a partir dos filtros ativos. */
function comFiltros(caminho: string, filtros?: Partial<Filtros>): string {
  if (!filtros) return caminho

  const parametros = new URLSearchParams()

  if (filtros.tipo && filtros.tipo !== 'todas') parametros.set('type', filtros.tipo)
  if (filtros.categoria) parametros.set('category', filtros.categoria)
  if (filtros.busca) parametros.set('search', filtros.busca)

  const query = parametros.toString()
  return query ? `${caminho}?${query}` : caminho
}

const apiRemota = {
  listarTransacoes(filtros?: Partial<Filtros>, sinal?: AbortSignal): Promise<Transacao[]> {
    return requisitar<Transacao[]>(comFiltros('/transactions', filtros), { signal: sinal ?? null })
  },

  obterResumo(filtros?: Partial<Filtros>, sinal?: AbortSignal): Promise<Resumo> {
    return requisitar<Resumo>(comFiltros('/summary', filtros), { signal: sinal ?? null })
  },

  listarCategorias(sinal?: AbortSignal): Promise<string[]> {
    return requisitar<string[]>('/categories', { signal: sinal ?? null })
  },

  criarTransacao(dados: NovaTransacao): Promise<Transacao> {
    return requisitar<Transacao>('/transactions', {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  },

  removerTransacao(id: string): Promise<void> {
    return requisitar<void>(`/transactions/${id}`, { method: 'DELETE' })
  },
}

export const api = MODO_LOCAL ? apiLocal : apiRemota
