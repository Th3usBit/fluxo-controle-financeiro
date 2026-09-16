/**
 * Tipos do domínio de transações.
 *
 * Os campos expostos pela API (title, amount, category, createdAt) são mantidos
 * em inglês porque fazem parte do contrato público do endpoint. Todo o resto do
 * código - funções, variáveis e mensagens - usa português.
 */

/** Uma transação com valor positivo é receita; negativo é despesa. */
export type TipoTransacao = 'receita' | 'despesa'

export interface Transacao {
  /** Identificador único gerado pelo back-end (UUID v4). */
  id: string
  /** Descrição curta da transação. Ex.: "Salário de setembro". */
  title: string
  /** Valor em reais. Positivo = receita, negativo = despesa. */
  amount: number
  /** Categoria livre. Ex.: "alimentação", "salário". */
  category: string
  /** Data de criação no formato ISO 8601. */
  createdAt: string
}

/** Dados aceitos na criação de uma transação, já validados e normalizados. */
export interface DadosDeNovaTransacao {
  title: string
  amount: number
  category: string
  /** Opcional: usado apenas pelos dados de exemplo. A API sempre gera a data. */
  createdAt?: string
}

/** Filtros opcionais aplicados na listagem e no resumo. */
export interface FiltroDeTransacoes {
  tipo?: TipoTransacao
  categoria?: string
  busca?: string
}

/** Totais consolidados de um conjunto de transações. */
export interface Resumo {
  /** Soma das receitas (sempre >= 0). */
  income: number
  /** Soma das despesas em valor absoluto (sempre >= 0). */
  expenses: number
  /** Saldo: receitas - despesas. */
  balance: number
  /** Quantidade de transações consideradas. */
  transactions: number
  /** Quebra por categoria, da maior movimentação para a menor. */
  byCategory: ResumoPorCategoria[]
}

export interface ResumoPorCategoria {
  category: string
  income: number
  expenses: number
  balance: number
  transactions: number
}

/** Descobre o tipo de uma transação a partir do sinal do valor. */
export function tipoDaTransacao(valor: number): TipoTransacao {
  return valor >= 0 ? 'receita' : 'despesa'
}
