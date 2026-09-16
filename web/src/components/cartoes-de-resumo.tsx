'use client'

import { IconeDespesa, IconeReceita, IconeSaldo } from '@/components/icones'
import { useValorAnimado } from '@/hooks/use-valor-animado'
import type { Resumo } from '@/types/transacao'
import { classes } from '@/utils/classes'
import { formatarMoeda, pluralizar, porcentagem } from '@/utils/formatar'

import estilos from './cartoes-de-resumo.module.css'

interface Props {
  resumo: Resumo | null
  carregando: boolean
}

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

      <p className={classes(estilos.valor, 'numero')}>
        {negativo ? <span className={estilos.sinal}>-</span> : null}
        {formatarMoeda(valorAnimado)}
      </p>

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
export function CartoesDeResumo({ resumo, carregando }: Props) {
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

  return (
    <section className={estilos.grade} aria-label="Resumo financeiro">
      <Cartao
        variante="receita"
        rotulo="Receitas"
        valor={totais.income}
        descricao={`${porcentagem(totais.income, movimentado)}% do que entrou e saiu`}
        icone={<IconeReceita tamanho={18} />}
        proporcao={porcentagem(totais.income, movimentado)}
        atraso={0}
      />

      <Cartao
        variante="despesa"
        rotulo="Despesas"
        valor={totais.expenses}
        descricao={`${porcentagem(totais.expenses, movimentado)}% do que entrou e saiu`}
        icone={<IconeDespesa tamanho={18} />}
        proporcao={porcentagem(totais.expenses, movimentado)}
        atraso={60}
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
        atraso={120}
      />
    </section>
  )
}
