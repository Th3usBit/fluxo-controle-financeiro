'use client'

import { useMemo } from 'react'

import { IconeGrafico } from '@/components/icones'
import type { Resumo, TipoTransacao } from '@/types/transacao'
import { classes } from '@/utils/classes'
import { formatarMoeda, pluralizar, porcentagem } from '@/utils/formatar'

import estilos from './grafico-de-categorias.module.css'

interface Props {
  resumo: Resumo | null
  /** Quando o filtro está em receitas, o gráfico acompanha e mostra entradas. */
  modo: TipoTransacao
  carregando: boolean
}

/** Acima disso as menores viram uma barra "Outras", para não virar sopa de letrinhas. */
const MAXIMO_DE_BARRAS = 6

interface Barra {
  categoria: string
  valor: number
  fatia: number
  transacoes: number
}

function montarBarras(resumo: Resumo | null, modo: TipoTransacao): { barras: Barra[]; total: number } {
  if (!resumo) return { barras: [], total: 0 }

  const valores = resumo.byCategory
    .map((categoria) => ({
      categoria: categoria.category,
      valor: modo === 'despesa' ? categoria.expenses : categoria.income,
      transacoes: categoria.transactions,
    }))
    .filter((item) => item.valor > 0)
    .sort((a, b) => b.valor - a.valor)

  const total = valores.reduce((soma, item) => soma + item.valor, 0)
  if (total === 0) return { barras: [], total: 0 }

  const principais = valores.slice(0, MAXIMO_DE_BARRAS)
  const restantes = valores.slice(MAXIMO_DE_BARRAS)

  if (restantes.length > 0) {
    principais.push({
      categoria: 'Outras',
      valor: restantes.reduce((soma, item) => soma + item.valor, 0),
      transacoes: restantes.reduce((soma, item) => soma + item.transacoes, 0),
    })
  }

  const maior = principais[0]?.valor ?? 1

  return {
    total,
    barras: principais.map((item) => ({
      ...item,
      fatia: Math.max(3, Math.round((item.valor / maior) * 100)),
    })),
  }
}

/**
 * Para onde o dinheiro está indo (ou de onde está vindo).
 *
 * É uma série só - a identidade já está no rótulo de cada linha -, então usa
 * uma cor única em vez de uma paleta por categoria, e cada barra carrega o
 * próprio valor em texto: ninguém precisa medir pixel para ler o número.
 */
export function GraficoDeCategorias({ resumo, modo, carregando }: Props) {
  const { barras, total } = useMemo(() => montarBarras(resumo, modo), [resumo, modo])

  const titulo = modo === 'despesa' ? 'Para onde vai o dinheiro' : 'De onde vem o dinheiro'
  const legenda = modo === 'despesa' ? 'Despesas por categoria' : 'Receitas por categoria'

  return (
    <section className={classes(estilos.painel, estilos[modo])} aria-label={legenda}>
      <header className={estilos.topo}>
        <div>
          <h2 className={estilos.titulo}>{titulo}</h2>
          <p className={estilos.legenda}>{legenda}</p>
        </div>

        <span className={estilos.icone} aria-hidden="true">
          <IconeGrafico tamanho={18} />
        </span>
      </header>

      {carregando && barras.length === 0 ? (
        <ul className={estilos.lista}>
          {[0, 1, 2, 3].map((posicao) => (
            <li key={posicao} className={estilos.esqueleto} aria-hidden="true">
              <span className={estilos.brilho} style={{ width: `${70 - posicao * 14}%` }} />
            </li>
          ))}
        </ul>
      ) : barras.length === 0 ? (
        <p className={estilos.vazio}>
          {modo === 'despesa'
            ? 'Nenhuma despesa registrada ainda.'
            : 'Nenhuma receita registrada ainda.'}
        </p>
      ) : (
        <ul className={estilos.lista}>
          {barras.map((barra, posicao) => (
            <li
              key={barra.categoria}
              className={estilos.item}
              style={{ animationDelay: `${posicao * 55}ms` }}
              title={`${barra.categoria}: ${formatarMoeda(barra.valor)} · ${pluralizar(
                barra.transacoes,
                'transação',
                'transações',
              )}`}
            >
              <div className={estilos.rotulos}>
                <span className={estilos.categoria}>{barra.categoria}</span>
                <span className={classes(estilos.valor, 'numero')}>
                  {formatarMoeda(barra.valor)}
                </span>
              </div>

              <div className={estilos.trilho}>
                <span className={estilos.preenchimento} style={{ width: `${barra.fatia}%` }} />
              </div>

              <span className={estilos.participacao}>
                {porcentagem(barra.valor, total)}% do total
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
