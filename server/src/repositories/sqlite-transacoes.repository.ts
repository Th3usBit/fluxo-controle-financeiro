import { randomUUID } from 'node:crypto'

import type { BancoDeDados } from '../database/conexao.js'
import type {
  DadosDeNovaTransacao,
  FiltroDeTransacoes,
  Transacao,
} from '../types/transacao.js'
import { normalizar, type RepositorioDeTransacoes } from './transacoes.repository.js'

/** Formato cru devolvido pelo SQLite (snake_case). */
interface LinhaDeTransacao {
  id: string
  title: string
  amount: number
  category: string
  created_at: string
}

function paraTransacao(linha: LinhaDeTransacao): Transacao {
  return {
    id: linha.id,
    title: linha.title,
    amount: linha.amount,
    category: linha.category,
    createdAt: linha.created_at,
  }
}

/** Persistencia em SQLite. É a implementação usada quando a API sobe. */
export class RepositorioDeTransacoesSqlite implements RepositorioDeTransacoes {
  constructor(private readonly banco: BancoDeDados) {}

  async listar(filtro: FiltroDeTransacoes = {}): Promise<Transacao[]> {
    const condicoes: string[] = []
    const parametros: Record<string, string | number> = {}

    if (filtro.tipo === 'receita') condicoes.push('amount >= 0')
    if (filtro.tipo === 'despesa') condicoes.push('amount < 0')

    if (filtro.categoria) {
      condicoes.push('normalizar(category) = @categoria')
      parametros.categoria = normalizar(filtro.categoria)
    }

    if (filtro.busca) {
      condicoes.push("normalizar(title) LIKE '%' || @busca || '%'")
      parametros.busca = normalizar(filtro.busca)
    }

    const onde = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : ''

    const linhas = this.banco
      .prepare(`SELECT * FROM transacoes ${onde} ORDER BY created_at DESC`)
      .all(parametros) as LinhaDeTransacao[]

    return linhas.map(paraTransacao)
  }

  async buscarPorId(id: string): Promise<Transacao | null> {
    const linha = this.banco.prepare('SELECT * FROM transacoes WHERE id = ?').get(id) as
      | LinhaDeTransacao
      | undefined

    return linha ? paraTransacao(linha) : null
  }

  async criar(dados: DadosDeNovaTransacao): Promise<Transacao> {
    const transacao: Transacao = {
      id: randomUUID(),
      title: dados.title,
      amount: dados.amount,
      category: dados.category,
      createdAt: dados.createdAt ?? new Date().toISOString(),
    }

    this.banco
      .prepare(
        `INSERT INTO transacoes (id, title, amount, category, created_at)
         VALUES (@id, @title, @amount, @category, @createdAt)`,
      )
      .run(transacao)

    return transacao
  }

  async remover(id: string): Promise<boolean> {
    const resultado = this.banco.prepare('DELETE FROM transacoes WHERE id = ?').run(id)
    return resultado.changes > 0
  }

  async listarCategorias(): Promise<string[]> {
    const linhas = this.banco
      .prepare('SELECT DISTINCT category FROM transacoes ORDER BY category COLLATE NOCASE')
      .all() as Array<{ category: string }>

    return linhas.map((linha) => linha.category)
  }

  /** Quantidade total de registros - usado para decidir se popula os exemplos. */
  contar(): number {
    const linha = this.banco.prepare('SELECT COUNT(*) AS total FROM transacoes').get() as {
      total: number
    }

    return linha.total
  }
}
