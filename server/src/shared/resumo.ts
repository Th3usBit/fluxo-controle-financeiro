import type { Resumo, ResumoPorCategoria, Transacao } from '../types/transacao.js'

/** Arredonda para 2 casas evitando o ruido de ponto flutuante (0.1 + 0.2). */
export function arredondar(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

/**
 * Consolida uma lista de transações em totais de receitas, despesas e saldo.
 * Regra de negócio pura: não conhece HTTP nem banco de dados, o que a torna
 * fácil de testar isoladamente.
 */
export function calcularResumo(transacoes: Transacao[]): Resumo {
  let receitas = 0
  let despesas = 0

  const porCategoria = new Map<string, ResumoPorCategoria>()

  for (const transacao of transacoes) {
    const ehReceita = transacao.amount >= 0
    const valorAbsoluto = Math.abs(transacao.amount)

    if (ehReceita) receitas += valorAbsoluto
    else despesas += valorAbsoluto

    const categoria = transacao.category
    const acumulado = porCategoria.get(categoria) ?? {
      category: categoria,
      income: 0,
      expenses: 0,
      balance: 0,
      transactions: 0,
    }

    if (ehReceita) acumulado.income += valorAbsoluto
    else acumulado.expenses += valorAbsoluto

    acumulado.transactions += 1
    porCategoria.set(categoria, acumulado)
  }

  const categorias = [...porCategoria.values()]
    .map((item) => ({
      ...item,
      income: arredondar(item.income),
      expenses: arredondar(item.expenses),
      balance: arredondar(item.income - item.expenses),
    }))
    .sort((a, b) => b.income + b.expenses - (a.income + a.expenses))

  return {
    income: arredondar(receitas),
    expenses: arredondar(despesas),
    balance: arredondar(receitas - despesas),
    transactions: transacoes.length,
    byCategory: categorias,
  }
}
