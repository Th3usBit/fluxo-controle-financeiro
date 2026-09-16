import { randomUUID } from 'node:crypto'

import type {
  DadosDeNovaTransacao,
  FiltroDeTransacoes,
  Transacao,
} from '../types/transacao.js'
import {
  daMaisRecente,
  normalizar,
  type RepositorioDeTransacoes,
} from './transacoes.repository.js'

/**
 * Guarda tudo em um array. Usado nos testes e disponível via STORAGE=memória
 * para quem quiser rodar a API sem criar arquivo em disco.
 */
export class RepositorioDeTransacoesEmMemoria implements RepositorioDeTransacoes {
  private transacoes: Transacao[] = []

  constructor(iniciais: Transacao[] = []) {
    this.transacoes = [...iniciais]
  }

  async listar(filtro: FiltroDeTransacoes = {}): Promise<Transacao[]> {
    const busca = filtro.busca ? normalizar(filtro.busca) : null
    const categoria = filtro.categoria ? normalizar(filtro.categoria) : null

    return this.transacoes
      .filter((transacao) => {
        if (filtro.tipo === 'receita' && transacao.amount < 0) return false
        if (filtro.tipo === 'despesa' && transacao.amount >= 0) return false
        if (categoria && normalizar(transacao.category) !== categoria) return false
        if (busca && !normalizar(transacao.title).includes(busca)) return false
        return true
      })
      .sort(daMaisRecente)
  }

  async buscarPorId(id: string): Promise<Transacao | null> {
    return this.transacoes.find((transacao) => transacao.id === id) ?? null
  }

  async criar(dados: DadosDeNovaTransacao): Promise<Transacao> {
    const transacao: Transacao = {
      id: randomUUID(),
      title: dados.title,
      amount: dados.amount,
      category: dados.category,
      createdAt: dados.createdAt ?? new Date().toISOString(),
    }

    this.transacoes.push(transacao)
    return transacao
  }

  async remover(id: string): Promise<boolean> {
    const indice = this.transacoes.findIndex((transacao) => transacao.id === id)
    if (indice === -1) return false

    this.transacoes.splice(indice, 1)
    return true
  }

  async listarCategorias(): Promise<string[]> {
    const categorias = new Set(this.transacoes.map((transacao) => transacao.category))
    return [...categorias].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }
}
