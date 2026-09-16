import { randomUUID } from 'node:crypto'

import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { calcularResumo } from '../src/shared/resumo.js'
import type { Transacao } from '../src/types/transacao.js'
import { criarAppDeTeste } from './ajuda.js'

function transacao(parcial: Partial<Transacao> = {}): Transacao {
  return {
    id: randomUUID(),
    title: 'Transacao',
    amount: 100,
    category: 'Outros',
    createdAt: new Date().toISOString(),
    ...parcial,
  }
}

describe('calcularResumo', () => {
  it('zera os totais quando não há transações', () => {
    expect(calcularResumo([])).toMatchObject({
      income: 0,
      expenses: 0,
      balance: 0,
      transactions: 0,
      byCategory: [],
    })
  })

  it('soma receitas, despesas e saldo', () => {
    const resumo = calcularResumo([
      transacao({ amount: 5400, category: 'Salario' }),
      transacao({ amount: -1800, category: 'Moradia' }),
      transacao({ amount: -200.5, category: 'Moradia' }),
    ])

    expect(resumo.income).toBe(5400)
    expect(resumo.expenses).toBe(2000.5)
    expect(resumo.balance).toBe(3399.5)
    expect(resumo.transactions).toBe(3)
  })

  it('evita o ruido de ponto flutuante', () => {
    const resumo = calcularResumo([transacao({ amount: 0.1 }), transacao({ amount: 0.2 })])

    expect(resumo.income).toBe(0.3)
  })

  it('agrupa por categoria da maior movimentação para a menor', () => {
    const resumo = calcularResumo([
      transacao({ amount: -50, category: 'Lazer' }),
      transacao({ amount: -900, category: 'Moradia' }),
      transacao({ amount: -100, category: 'Moradia' }),
    ])

    expect(resumo.byCategory[0]).toMatchObject({
      category: 'Moradia',
      expenses: 1000,
      transactions: 2,
    })
  })
})

describe('GET /summary', () => {
  it('devolve o saldo considerando receitas e despesas', async () => {
    const app = criarAppDeTeste()

    await request(app)
      .post('/transactions')
      .send({ title: 'Salario', amount: 5000, category: 'Salario' })
    await request(app)
      .post('/transactions')
      .send({ title: 'Aluguel', amount: -1800, category: 'Moradia' })

    const resposta = await request(app).get('/summary')

    expect(resposta.status).toBe(200)
    expect(resposta.body).toMatchObject({
      income: 5000,
      expenses: 1800,
      balance: 3200,
      transactions: 2,
    })
  })

  it('respeita os mesmos filtros da listagem', async () => {
    const app = criarAppDeTeste()

    await request(app)
      .post('/transactions')
      .send({ title: 'Salario', amount: 5000, category: 'Salario' })
    await request(app)
      .post('/transactions')
      .send({ title: 'Mercado', amount: -300, category: 'Alimentacao' })

    const resposta = await request(app).get('/summary?type=despesa')

    expect(resposta.body).toMatchObject({
      income: 0,
      expenses: 300,
      balance: -300,
      transactions: 1,
    })
  })
})
