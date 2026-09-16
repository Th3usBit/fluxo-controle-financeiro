'use client'

import { useMemo } from 'react'

import type { Resumo, Transacao } from '@/types/transacao'
import { classes } from '@/utils/classes'
import { formatarDataCurta, formatarMoeda } from '@/utils/formatar'

import estilos from './destaques.module.css'

interface Props {
  transacoes: Transacao[]
  resumo: Resumo | null
}

interface Destaque {
  rotulo: string
  valor: string
  detalhe: string
  variante?: 'receita' | 'despesa'
}

function montarDestaques(transacoes: Transacao[], resumo: Resumo | null): Destaque[] {
  if (transacoes.length === 0) return []

  const despesas = transacoes.filter((transacao) => transacao.amount < 0)
  const receitas = transacoes.filter((transacao) => transacao.amount >= 0)

  const destaques: Destaque[] = []

  const maiorDespesa = despesas.reduce<Transacao | null>(
    (maior, atual) => (!maior || atual.amount < maior.amount ? atual : maior),
    null,
  )

  if (maiorDespesa) {
    destaques.push({
      rotulo: 'Maior despesa',
      valor: formatarMoeda(maiorDespesa.amount),
      detalhe: `${maiorDespesa.title} · ${formatarDataCurta(maiorDespesa.createdAt)}`,
      variante: 'despesa',
    })
  }

  const maiorReceita = receitas.reduce<Transacao | null>(
    (maior, atual) => (!maior || atual.amount > maior.amount ? atual : maior),
    null,
  )

  if (maiorReceita) {
    destaques.push({
      rotulo: 'Maior receita',
      valor: formatarMoeda(maiorReceita.amount),
      detalhe: `${maiorReceita.title} · ${formatarDataCurta(maiorReceita.createdAt)}`,
      variante: 'receita',
    })
  }

  const categoriaLider = resumo?.byCategory
    .filter((categoria) => categoria.expenses > 0)
    .sort((a, b) => b.expenses - a.expenses)[0]

  if (categoriaLider) {
    destaques.push({
      rotulo: 'Categoria que mais pesa',
      valor: categoriaLider.category,
      detalhe: `${formatarMoeda(categoriaLider.expenses)} em ${categoriaLider.transactions} ${
        categoriaLider.transactions === 1 ? 'lançamento' : 'lançamentos'
      }`,
    })
  }

  if (despesas.length > 0) {
    const media =
      despesas.reduce((soma, transacao) => soma + Math.abs(transacao.amount), 0) / despesas.length

    destaques.push({
      rotulo: 'Gasto médio',
      valor: formatarMoeda(media),
      detalhe: `Média de ${despesas.length} ${despesas.length === 1 ? 'despesa' : 'despesas'}`,
    })
  }

  return destaques
}

/** Leitura rápida do que chama atenção nos números filtrados. */
export function Destaques({ transacoes, resumo }: Props) {
  const destaques = useMemo(() => montarDestaques(transacoes, resumo), [transacoes, resumo])

  if (destaques.length === 0) return null

  return (
    <section className={estilos.painel} aria-label="Destaques">
      <h2 className={estilos.titulo}>Destaques</h2>

      <ul className={estilos.lista}>
        {destaques.map((destaque) => (
          <li key={destaque.rotulo} className={estilos.item}>
            <span className={estilos.rotulo}>{destaque.rotulo}</span>

            <div className={estilos.conteudo}>
              <strong
                className={classes(
                  estilos.valor,
                  'numero',
                  destaque.variante && estilos[destaque.variante],
                )}
              >
                {destaque.valor}
              </strong>
              <span className={estilos.detalhe}>{destaque.detalhe}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
