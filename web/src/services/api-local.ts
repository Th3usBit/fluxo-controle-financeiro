import type {
  Filtros,
  NovaTransacao,
  Resumo,
  ResumoPorCategoria,
  Transacao,
} from '@/types/transacao'

/**
 * Implementação da API que roda inteira no navegador, usada na versão
 * publicada no GitHub Pages (que só serve arquivos estáticos).
 *
 * Segue o mesmo contrato e as mesmas regras do back-end: filtros que ignoram
 * acento e caixa, sinal do valor decidido pelo tipo, resumo com arredondamento
 * em centavos. Os dados ficam no localStorage de cada visitante.
 */

const CHAVE = 'fluxo:transacoes'

/** Mesmas transações de exemplo que a API cadastra na primeira execução. */
const EXEMPLOS = [
  { title: 'Salário', amount: 5400, category: 'Salário', diasAtras: 14 },
  { title: 'Aluguel', amount: -1800, category: 'Moradia', diasAtras: 13 },
  { title: 'Plano de saúde', amount: -389.9, category: 'Saúde', diasAtras: 11 },
  { title: 'Supermercado do mês', amount: -742.35, category: 'Alimentação', diasAtras: 9 },
  { title: 'Freela de landing page', amount: 1250, category: 'Freelance', diasAtras: 7 },
  { title: 'Internet fibra', amount: -119.9, category: 'Moradia', diasAtras: 6 },
  { title: 'Passagem de ônibus', amount: -230, category: 'Transporte', diasAtras: 4 },
  { title: 'Venda de monitor usado', amount: 620, category: 'Vendas', diasAtras: 3 },
  { title: 'Assinatura de streaming', amount: -55.9, category: 'Lazer', diasAtras: 2 },
  { title: 'Jantar de aniversário', amount: -184.7, category: 'Alimentação', diasAtras: 1 },
]

/** Usado se o navegador bloquear o localStorage (aba anônima restrita etc.). */
let memoria: Transacao[] | null = null

function gerarId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function exemplos(): Transacao[] {
  return EXEMPLOS.map(({ diasAtras, ...exemplo }) => {
    const data = new Date()
    data.setDate(data.getDate() - diasAtras)
    return { id: gerarId(), ...exemplo, createdAt: data.toISOString() }
  })
}

function carregar(): Transacao[] {
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo !== null) return JSON.parse(salvo) as Transacao[]

    const iniciais = exemplos()
    localStorage.setItem(CHAVE, JSON.stringify(iniciais))
    return iniciais
  } catch {
    memoria ??= exemplos()
    return memoria
  }
}

function salvar(transacoes: Transacao[]): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(transacoes))
  } catch {
    memoria = transacoes
  }
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
}

function arredondar(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

function filtrar(transacoes: Transacao[], filtros: Partial<Filtros> = {}): Transacao[] {
  const busca = filtros.busca ? normalizar(filtros.busca) : null
  const categoria = filtros.categoria ? normalizar(filtros.categoria) : null

  return transacoes
    .filter((transacao) => {
      if (filtros.tipo === 'receita' && transacao.amount < 0) return false
      if (filtros.tipo === 'despesa' && transacao.amount >= 0) return false
      if (categoria && normalizar(transacao.category) !== categoria) return false
      if (busca && !normalizar(transacao.title).includes(busca)) return false
      return true
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function calcularResumo(transacoes: Transacao[]): Resumo {
  let receitas = 0
  let despesas = 0
  const porCategoria = new Map<string, ResumoPorCategoria>()

  for (const transacao of transacoes) {
    const ehReceita = transacao.amount >= 0
    const valor = Math.abs(transacao.amount)

    if (ehReceita) receitas += valor
    else despesas += valor

    const acumulado = porCategoria.get(transacao.category) ?? {
      category: transacao.category,
      income: 0,
      expenses: 0,
      balance: 0,
      transactions: 0,
    }

    if (ehReceita) acumulado.income += valor
    else acumulado.expenses += valor

    acumulado.transactions += 1
    porCategoria.set(transacao.category, acumulado)
  }

  return {
    income: arredondar(receitas),
    expenses: arredondar(despesas),
    balance: arredondar(receitas - despesas),
    transactions: transacoes.length,
    byCategory: [...porCategoria.values()]
      .map((item) => ({
        ...item,
        income: arredondar(item.income),
        expenses: arredondar(item.expenses),
        balance: arredondar(item.income - item.expenses),
      }))
      .sort((a, b) => b.income + b.expenses - (a.income + a.expenses)),
  }
}

export const apiLocal = {
  async listarTransacoes(filtros?: Partial<Filtros>): Promise<Transacao[]> {
    return filtrar(carregar(), filtros)
  },

  async obterResumo(filtros?: Partial<Filtros>): Promise<Resumo> {
    return calcularResumo(filtrar(carregar(), filtros))
  },

  async listarCategorias(): Promise<string[]> {
    const categorias = new Set(carregar().map((transacao) => transacao.category))
    return [...categorias].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  },

  async criarTransacao(dados: NovaTransacao): Promise<Transacao> {
    const valor = Math.abs(dados.amount)
    const transacao: Transacao = {
      id: gerarId(),
      title: dados.title.trim(),
      amount: dados.type === 'despesa' ? -valor : valor,
      category: dados.category.trim(),
      createdAt: new Date().toISOString(),
    }

    salvar([...carregar(), transacao])
    return transacao
  },

  async removerTransacao(id: string): Promise<void> {
    salvar(carregar().filter((transacao) => transacao.id !== id))
  },
}
