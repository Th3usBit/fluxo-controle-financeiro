/**
 * Espelho tipado do contrato da API.
 *
 * Os nomes dos campos vêm do back-end (title, amount, category, createdAt) e
 * são mantidos como estão; todo o vocabulário da interface é em português.
 */

export type TipoTransacao = 'receita' | 'despesa'

export interface Transacao {
  id: string
  title: string
  /** Positivo = receita, negativo = despesa. */
  amount: number
  category: string
  /** Data em ISO 8601. */
  createdAt: string
}

/** Dados enviados no POST /transactions. */
export interface NovaTransacao {
  title: string
  amount: number
  category: string
  type: TipoTransacao
}

export interface ResumoPorCategoria {
  category: string
  income: number
  expenses: number
  balance: number
  transactions: number
}

/** Resposta do GET /summary. */
export interface Resumo {
  income: number
  expenses: number
  balance: number
  transactions: number
  byCategory: ResumoPorCategoria[]
}

export type FiltroDeTipo = TipoTransacao | 'todas'

export interface Filtros {
  tipo: FiltroDeTipo
  categoria: string
  busca: string
}

export const FILTROS_PADRAO: Filtros = {
  tipo: 'todas',
  categoria: '',
  busca: '',
}

/** Descobre o tipo pelo sinal do valor. */
export function tipoDaTransacao(valor: number): TipoTransacao {
  return valor >= 0 ? 'receita' : 'despesa'
}
