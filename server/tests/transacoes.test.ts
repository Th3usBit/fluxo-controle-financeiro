import type { Express } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

import { criarAppDeTeste } from './ajuda.js'

describe('GET /transactions', () => {
  let app: Express

  beforeEach(() => {
    app = criarAppDeTeste()
  })

  it('começa com uma lista vazia', async () => {
    const resposta = await request(app).get('/transactions')

    expect(resposta.status).toBe(200)
    expect(resposta.body).toEqual([])
  })

  it('devolve as transações da mais recente para a mais antiga', async () => {
    await request(app)
      .post('/transactions')
      .send({ title: 'Primeira', amount: 10, category: 'Teste' })
    await request(app)
      .post('/transactions')
      .send({ title: 'Segunda', amount: 20, category: 'Teste' })

    const resposta = await request(app).get('/transactions')

    expect(resposta.body).toHaveLength(2)
    expect(resposta.body[0].title).toBe('Segunda')
  })

  it('filtra por tipo, categoria e busca por título', async () => {
    await request(app)
      .post('/transactions')
      .send({ title: 'Salario', amount: 3000, category: 'Salario' })
    await request(app)
      .post('/transactions')
      .send({ title: 'Mercado', amount: -250, category: 'Alimentacao' })
    await request(app)
      .post('/transactions')
      .send({ title: 'Padaria', amount: -30, category: 'Alimentacao' })

    const despesas = await request(app).get('/transactions?type=despesa')
    expect(despesas.body).toHaveLength(2)

    const alimentacao = await request(app).get('/transactions?category=alimentacao')
    expect(alimentacao.body).toHaveLength(2)

    const busca = await request(app).get('/transactions?search=sal')
    expect(busca.body).toHaveLength(1)
    expect(busca.body[0].title).toBe('Salario')
  })
})

describe('POST /transactions', () => {
  let app: Express

  beforeEach(() => {
    app = criarAppDeTeste()
  })

  it('cria uma transação com id e data gerados pelo back-end', async () => {
    const resposta = await request(app)
      .post('/transactions')
      .send({ title: 'Salário de setembro', amount: 5400, category: 'Salario' })

    expect(resposta.status).toBe(201)
    expect(resposta.body).toMatchObject({
      title: 'Salário de setembro',
      amount: 5400,
      category: 'Salario',
    })
    expect(resposta.body.id).toBeTypeOf('string')
    expect(Number.isNaN(Date.parse(resposta.body.createdAt))).toBe(false)
  })

  it('guarda despesa como valor negativo quando o tipo é enviado', async () => {
    const resposta = await request(app)
      .post('/transactions')
      .send({ title: 'Mercado', amount: 250, category: 'Alimentacao', type: 'despesa' })

    expect(resposta.status).toBe(201)
    expect(resposta.body.amount).toBe(-250)
  })

  it('recusa campos faltando e explica o que está errado', async () => {
    const resposta = await request(app).post('/transactions').send({ title: 'Só o título' })

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro.mensagem).toBeTypeOf('string')

    const campos = resposta.body.erro.detalhes.map((detalhe: { campo: string }) => detalhe.campo)
    expect(campos).toContain('amount')
    expect(campos).toContain('category')
  })

  it('recusa valor zero e título curto demais', async () => {
    const zerado = await request(app)
      .post('/transactions')
      .send({ title: 'Teste', amount: 0, category: 'Outros' })
    expect(zerado.status).toBe(400)

    const tituloCurto = await request(app)
      .post('/transactions')
      .send({ title: 'a', amount: 10, category: 'Outros' })
    expect(tituloCurto.status).toBe(400)
  })

  it('aceita valor em texto e remove espaços em branco', async () => {
    const resposta = await request(app)
      .post('/transactions')
      .send({ title: '  Freela  ', amount: '1250,50', category: ' Freelance ' })

    expect(resposta.status).toBe(201)
    expect(resposta.body.title).toBe('Freela')
    expect(resposta.body.amount).toBe(1250.5)
    expect(resposta.body.category).toBe('Freelance')
  })

  it('recusa corpo com campo desconhecido', async () => {
    const resposta = await request(app)
      .post('/transactions')
      .send({ titulo: 'Campo errado', amount: 10, category: 'Outros' })

    expect(resposta.status).toBe(400)
  })
})

describe('DELETE /transactions/:id', () => {
  it('remove a transação e ela some da listagem', async () => {
    const app = criarAppDeTeste()

    const criada = await request(app)
      .post('/transactions')
      .send({ title: 'Conta de luz', amount: -180, category: 'Moradia' })

    const remocao = await request(app).delete('/transactions/' + criada.body.id)
    expect(remocao.status).toBe(204)

    const lista = await request(app).get('/transactions')
    expect(lista.body).toEqual([])
  })

  it('devolve 404 quando o id não existe', async () => {
    const remocao = await request(criarAppDeTeste()).delete('/transactions/id-que-nao-existe')

    expect(remocao.status).toBe(404)
    expect(remocao.body.erro.mensagem).toContain('não encontrada')
  })
})

describe('rotas desconhecidas', () => {
  it('respondem 404 em JSON', async () => {
    const resposta = await request(criarAppDeTeste()).get('/rota-inexistente')

    expect(resposta.status).toBe(404)
    expect(resposta.body.erro.mensagem).toContain('Rota não encontrada')
  })
})
