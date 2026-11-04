import { beforeEach, describe, expect, it } from 'vitest'

import { apiLocal } from '@/services/api-local'

describe('api local (versão do GitHub Pages)', () => {
  beforeEach(() => localStorage.clear())

  it('abre com as 10 transações de exemplo', async () => {
    expect(await apiLocal.listarTransacoes()).toHaveLength(10)
  })

  it('usa o tipo para decidir o sinal e soma no resumo', async () => {
    const antes = await apiLocal.obterResumo()
    const criada = await apiLocal.criarTransacao({
      title: ' Consulta médica ',
      amount: 189.9,
      category: 'Saúde',
      type: 'despesa',
    })

    expect(criada.amount).toBe(-189.9)
    expect(criada.title).toBe('Consulta médica')

    const depois = await apiLocal.obterResumo()
    expect(depois.expenses).toBe(Math.round((antes.expenses + 189.9) * 100) / 100)
  })

  it('filtra ignorando acento e caixa, e remove', async () => {
    const saude = await apiLocal.listarTransacoes({ categoria: 'SAUDE' })
    expect(saude.map((t) => t.title)).toEqual(['Plano de saúde'])

    await apiLocal.removerTransacao(saude[0]?.id ?? '')
    expect(await apiLocal.listarTransacoes({ categoria: 'saúde' })).toHaveLength(0)
  })
})
