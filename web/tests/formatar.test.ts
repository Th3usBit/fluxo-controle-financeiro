import { describe, expect, it } from 'vitest'

import {
  aplicarMascaraDeMoeda,
  chaveDoDia,
  iniciaisDaCategoria,
  mascaraParaNumero,
  pluralizar,
  porcentagem,
  rotuloDoDia,
} from '@/utils/formatar'

describe('máscara de moeda', () => {
  it('preenche da direita para a esquerda enquanto o usuário digita', () => {
    expect(aplicarMascaraDeMoeda('1')).toBe('0,01')
    expect(aplicarMascaraDeMoeda('12')).toBe('0,12')
    expect(aplicarMascaraDeMoeda('123')).toBe('1,23')
    expect(aplicarMascaraDeMoeda('123456')).toBe('1.234,56')
  })

  it('ignora letras e símbolos', () => {
    expect(aplicarMascaraDeMoeda('R$ 45,90abc')).toBe('45,90')
  })

  it('devolve texto vazio quando não há dígito nenhum', () => {
    expect(aplicarMascaraDeMoeda('abc')).toBe('')
  })

  it('volta para número na hora de enviar para a API', () => {
    expect(mascaraParaNumero('1.234,56')).toBe(1234.56)
    expect(mascaraParaNumero('0,99')).toBe(0.99)
    expect(mascaraParaNumero('')).toBe(0)
  })
})

describe('rótulos de data', () => {
  it('chama o dia de hoje de "Hoje"', () => {
    expect(rotuloDoDia(new Date().toISOString())).toBe('Hoje')
  })

  it('chama o dia anterior de "Ontem"', () => {
    const ontem = new Date()
    ontem.setDate(ontem.getDate() - 1)

    expect(rotuloDoDia(ontem.toISOString())).toBe('Ontem')
  })

  it('usa a data por extenso para dias mais antigos', () => {
    expect(rotuloDoDia('2026-03-08T12:00:00.000Z')).toContain('março')
  })

  it('agrupa pelo dia local, não pelo fuso do servidor', () => {
    const data = new Date(2026, 2, 8, 23, 30)
    expect(chaveDoDia(data.toISOString())).toBe('2026-03-08')
  })
})

describe('apoio de interface', () => {
  it('monta as iniciais da categoria', () => {
    expect(iniciaisDaCategoria('Alimentação')).toBe('AL')
    expect(iniciaisDaCategoria('Conta de luz')).toBe('CD')
    expect(iniciaisDaCategoria('  ')).toBe('??')
  })

  it('calcula porcentagem sem estourar nem dividir por zero', () => {
    expect(porcentagem(50, 200)).toBe(25)
    expect(porcentagem(10, 0)).toBe(0)
    expect(porcentagem(300, 200)).toBe(100)
  })

  it('escolhe singular ou plural', () => {
    expect(pluralizar(1, 'transação', 'transações')).toBe('1 transação')
    expect(pluralizar(3, 'transação', 'transações')).toBe('3 transações')
  })
})
