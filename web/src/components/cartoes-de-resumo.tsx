'use client'

import type { CSSProperties } from 'react'

import { IconeDespesa, IconeReceita, IconeSaldo } from '@/components/icones'
import type { Mudanca } from '@/hooks/use-transacoes'
import { useValorAnimado } from '@/hooks/use-valor-animado'
import type { Resumo } from '@/types/transacao'
import { classes } from '@/utils/classes'
import { formatarMoeda, formatarMoedaComSinal, pluralizar, porcentagem } from '@/utils/formatar'

import estilos from './cartoes-de-resumo.module.css'

interface Props {
  resumo: Resumo | null
  carregando: boolean
  /** Última ação da pessoa; null quando há filtro ativo (o total não reflete tudo). */
  mudanca: Mudanca | null
}

interface Variacao {
  chave: number
  valor: number
  /** true quando a mudança fez o saldo subir: a cor segue o efeito no dinheiro. */
  boaNoticia: boolean
}

/** Quantas faíscas saem do número quando ele muda. */
const FAISCAS = Array.from({ length: 14 }, (_, indice) => indice)

interface PropsDoCartao {
  variante: 'receita' | 'despesa' | 'saldo'
  rotulo: string
  valor: number
  descricao: string
  icone: React.ReactNode
  /** 0 a 100: barrinha de proporção no rodapé do cartão. */
  proporcao: number
  destaque?: boolean
  atraso: number
  variacao: Variacao | null
}

function Cartao({
  variante,
  rotulo,
  valor,
  descricao,
  icone,
  proporcao,
  destaque = false,
  atraso,
  variacao,
}: PropsDoCartao) {
  const valorAnimado = useValorAnimado(valor)
  const negativo = valorAnimado < 0

  return (
    <article
      className={classes(estilos.cartao, estilos[variante], destaque && estilos.destaque)}
      style={{ animationDelay: `${atraso}ms` }}
    >
      <header className={estilos.topo}>
        <span className={estilos.rotulo}>{rotulo}</span>
        <span className={estilos.icone} aria-hidden="true">
          {icone}
        </span>
      </header>

      <div className={estilos.areaDoValor}>
        <p className={classes(estilos.valor, 'numero')}>
          {negativo ? <span className={estilos.sinal}>-</span> : null}
          {formatarMoeda(valorAnimado)}
        </p>

        {variacao ? (
          <span
            key={variacao.chave}
            className={classes(
              estilos.variacao,
              variacao.boaNoticia ? estilos.variacaoPositiva : estilos.variacaoNegativa,
              'numero',
            )}
            aria-hidden="true"
          >
            {formatarMoedaComSinal(variacao.valor)}
          </span>
        ) : null}

        {variacao ? (
          <span key={`faiscas-${variacao.chave}`} className={estilos.faiscas} aria-hidden="true">
            {FAISCAS.map((indice) => (
              <i key={indice} style={{ '--indice': indice } as CSSProperties} />
            ))}
          </span>
        ) : null}
      </div>

      {variacao ? (
        <span key={`impacto-${variacao.chave}`} className={estilos.impacto} aria-hidden="true" />
      ) : null}

      <footer className={estilos.rodape}>
        <div
          className={estilos.barra}
          role="img"
          aria-label={`${proporcao}% do total movimentado`}
        >
          <span className={estilos.preenchimento} style={{ width: `${proporcao}%` }} />
        </div>
        <span className={estilos.descricao}>{descricao}</span>
      </footer>
    </article>
  )
}

function CartaoVazio({ atraso }: { atraso: number }) {
  return (
    <article
      className={classes(estilos.cartao, estilos.esqueleto)}
      style={{ animationDelay: `${atraso}ms` }}
      aria-hidden="true"
    >
      <div className={classes(estilos.brilho, estilos.linhaCurta)} />
      <div className={classes(estilos.brilho, estilos.linhaGrande)} />
      <div className={classes(estilos.brilho, estilos.linhaMedia)} />
    </article>
  )
}

/** Os três números que respondem "como estou de dinheiro?" em um olhar. */
/** Quanto cada cartão mudou com a última ação, para o selo "+ R$ 189,90". */
function variacoes(mudanca: Mudanca | null): Record<'receita' | 'despesa' | 'saldo', Variacao | null> {
  if (!mudanca) return { receita: null, despesa: null, saldo: null }

  const { chave, amount, sentido } = mudanca
  const ehReceita = amount >= 0
  // Lançar receita ou excluir despesa melhora o saldo; o contrário piora.
  const boaNoticia = sentido * amount >= 0

  return {
    receita: ehReceita ? { chave, valor: sentido * amount, boaNoticia } : null,
    despesa: ehReceita ? null : { chave, valor: sentido * Math.abs(amount), boaNoticia },
    saldo: { chave, valor: sentido * amount, boaNoticia },
  }
}

export function CartoesDeResumo({ resumo, carregando, mudanca }: Props) {
  if (carregando && !resumo) {
    return (
      <section className={estilos.grade} aria-busy="true" aria-label="Carregando totais">
        <CartaoVazio atraso={0} />
        <CartaoVazio atraso={60} />
        <CartaoVazio atraso={120} />
      </section>
    )
  }

  const totais = resumo ?? { income: 0, expenses: 0, balance: 0, transactions: 0, byCategory: [] }
  const movimentado = totais.income + totais.expenses
  const variacao = variacoes(mudanca)

  return (
    <section className={estilos.grade} aria-label="Resumo financeiro">
      <Cartao
        variante="receita"
        rotulo="Receitas"
        valor={totais.income}
        descricao={`${porcentagem(totais.income, movimentado)}% do que entrou e saiu`}
        icone={<IconeReceita tamanho={18} />}
        proporcao={porcentagem(totais.income, movimentado)}
        atraso={120}
        variacao={variacao.receita}
      />

      <Cartao
        variante="despesa"
        rotulo="Despesas"
        valor={totais.expenses}
        descricao={`${porcentagem(totais.expenses, movimentado)}% do que entrou e saiu`}
        icone={<IconeDespesa tamanho={18} />}
        proporcao={porcentagem(totais.expenses, movimentado)}
        atraso={220}
        variacao={variacao.despesa}
      />

      <Cartao
        variante="saldo"
        rotulo="Saldo atual"
        valor={totais.balance}
        descricao={
          totais.transactions === 0
            ? 'Nenhuma transação registrada'
            : `${pluralizar(totais.transactions, 'transação', 'transações')} · ${
                totais.balance >= 0 ? 'no azul' : 'no vermelho'
              }`
        }
        icone={<IconeSaldo tamanho={18} />}
        proporcao={totais.balance >= 0 ? porcentagem(totais.balance, totais.income) : 100}
        destaque
        atraso={0}
        variacao={variacao.saldo}
      />
    </section>
  )
}
