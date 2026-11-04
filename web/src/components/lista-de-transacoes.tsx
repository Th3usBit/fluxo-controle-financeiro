'use client'

import { useMemo, useState, type CSSProperties } from 'react'

import {
  IconeAlerta,
  IconeCarteiraVazia,
  IconeDespesa,
  IconeLixeira,
  IconeMais,
  IconeRecarregar,
} from '@/components/icones'
import type { Transacao } from '@/types/transacao'
import { tipoDaTransacao } from '@/types/transacao'
import { classes } from '@/utils/classes'
import {
  chaveDoDia,
  formatarHora,
  formatarMoeda,
  iniciaisDaCategoria,
  pluralizar,
  rotuloDoDia,
} from '@/utils/formatar'

import estilos from './lista-de-transacoes.module.css'

interface Props {
  transacoes: Transacao[]
  carregando: boolean
  erro: string | null
  temFiltroAtivo: boolean
  /** Transação que acabou de ser lançada: entra com destaque. */
  idRecente: string | null
  aoRemover: (transacao: Transacao) => Promise<void>
  aoNovaTransacao: () => void
  aoLimparFiltros: () => void
  aoTentarDeNovo: () => void
}

interface Grupo {
  chave: string
  rotulo: string
  transacoes: Transacao[]
  total: number
}

/** Quebra a lista em blocos por dia ("Hoje", "Ontem", "12 de setembro de 2026"). */
function agruparPorDia(transacoes: Transacao[]): Grupo[] {
  const grupos = new Map<string, Grupo>()

  for (const transacao of transacoes) {
    const chave = chaveDoDia(transacao.createdAt)

    const grupo = grupos.get(chave) ?? {
      chave,
      rotulo: rotuloDoDia(transacao.createdAt),
      transacoes: [],
      total: 0,
    }

    grupo.transacoes.push(transacao)
    grupo.total += transacao.amount
    grupos.set(chave, grupo)
  }

  return [...grupos.values()].sort((a, b) => b.chave.localeCompare(a.chave))
}

/** Tempo da animação de saída antes de a linha sair de fato da lista. */
const DURACAO_DA_SAIDA = 420

function preferePoucoMovimento(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms))
}

interface PropsDoItem {
  transacao: Transacao
  /** Posição na lista, para a entrada em cascata. */
  ordem: number
  recente: boolean
  emConfirmacao: boolean
  removendo: boolean
  aoPedirRemocao: () => void
  aoCancelar: () => void
  aoConfirmar: () => void
}

function ItemDeTransacao({
  transacao,
  ordem,
  recente,
  emConfirmacao,
  removendo,
  aoPedirRemocao,
  aoCancelar,
  aoConfirmar,
}: PropsDoItem) {
  const tipo = tipoDaTransacao(transacao.amount)

  return (
    <li
      className={classes(
        estilos.item,
        estilos[tipo],
        recente && estilos.recente,
        removendo && estilos.saindo,
      )}
      style={{ '--ordem': Math.min(ordem, 14) } as CSSProperties}
    >
      <span className={estilos.avatar} aria-hidden="true">
        {iniciaisDaCategoria(transacao.category)}
      </span>

      <div className={estilos.dados}>
        <p className={estilos.tituloDaTransacao}>{transacao.title}</p>

        <p className={estilos.detalhes}>
          <span className={estilos.etiqueta}>{transacao.category}</span>
          <span className={estilos.separador} aria-hidden="true">
            ·
          </span>
          <time dateTime={transacao.createdAt}>{formatarHora(transacao.createdAt)}</time>
        </p>
      </div>

      <p className={classes(estilos.valor, 'numero')}>
        {tipo === 'despesa' ? '-' : '+'} {formatarMoeda(transacao.amount)}
        <span className="apenas-leitor-de-tela">
          {tipo === 'despesa' ? ' (despesa)' : ' (receita)'}
        </span>
      </p>

      {emConfirmacao ? (
        <div className={estilos.confirmacao}>
          <span className={estilos.perguntaDeConfirmacao}>Excluir?</span>

          <button type="button" className={estilos.confirmar} onClick={aoConfirmar}>
            Sim
          </button>

          <button type="button" className={estilos.cancelar} onClick={aoCancelar}>
            Não
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={estilos.excluir}
          onClick={aoPedirRemocao}
          aria-label={`Excluir a transação ${transacao.title}`}
          title="Excluir transação"
        >
          <IconeLixeira tamanho={17} />
        </button>
      )}
    </li>
  )
}

function ItemEsqueleto() {
  return (
    <li className={estilos.itemEsqueleto} aria-hidden="true">
      <span className={classes(estilos.brilho, estilos.brilhoAvatar)} />
      <div className={estilos.colunaEsqueleto}>
        <span className={classes(estilos.brilho, estilos.brilhoTitulo)} />
        <span className={classes(estilos.brilho, estilos.brilhoDetalhe)} />
      </div>
      <span className={classes(estilos.brilho, estilos.brilhoValor)} />
    </li>
  )
}

export function ListaDeTransacoes({
  transacoes,
  carregando,
  erro,
  temFiltroAtivo,
  idRecente,
  aoRemover,
  aoNovaTransacao,
  aoLimparFiltros,
  aoTentarDeNovo,
}: Props) {
  const [idEmConfirmacao, definirIdEmConfirmacao] = useState<string | null>(null)
  const [idRemovendo, definirIdRemovendo] = useState<string | null>(null)

  const grupos = useMemo(() => agruparPorDia(transacoes), [transacoes])

  // Posição de cada transação na lista inteira (não só no dia), para a cascata.
  const ordemDe = useMemo(
    () => new Map(transacoes.map((transacao, posicao) => [transacao.id, posicao])),
    [transacoes],
  )

  async function confirmarRemocao(transacao: Transacao): Promise<void> {
    definirIdRemovendo(transacao.id)
    definirIdEmConfirmacao(null)

    // Deixa a linha terminar de sair antes de tirá-la da lista.
    if (!preferePoucoMovimento()) await esperar(DURACAO_DA_SAIDA)

    try {
      await aoRemover(transacao)
    } finally {
      definirIdRemovendo(null)
    }
  }

  return (
    <section className={estilos.painel} aria-label="Transações">
      <header className={estilos.topo}>
        <div>
          <h2 className={estilos.titulo}>Transações</h2>
          <p className={estilos.subtitulo}>
            {carregando && transacoes.length === 0
              ? 'Carregando...'
              : pluralizar(transacoes.length, 'registro encontrado', 'registros encontrados')}
          </p>
        </div>

        <button type="button" className={estilos.botaoAdicionar} onClick={aoNovaTransacao}>
          <IconeMais tamanho={16} />
          <span>Adicionar</span>
        </button>
      </header>

      {erro ? (
        <div className={estilos.erro} role="alert">
          <span className={estilos.iconeDeErro}>
            <IconeAlerta tamanho={22} />
          </span>

          <div>
            <strong>Não deu para carregar as transações</strong>
            <p>{erro}</p>
          </div>

          <button type="button" className={estilos.tentarDeNovo} onClick={aoTentarDeNovo}>
            <IconeRecarregar tamanho={16} />
            Tentar de novo
          </button>
        </div>
      ) : carregando && transacoes.length === 0 ? (
        <ul className={estilos.lista} aria-busy="true">
          {[0, 1, 2, 3, 4].map((posicao) => (
            <ItemEsqueleto key={posicao} />
          ))}
        </ul>
      ) : transacoes.length === 0 ? (
        <div className={estilos.vazio}>
          <span className={estilos.iconeVazio} aria-hidden="true">
            {temFiltroAtivo ? <IconeDespesa tamanho={28} /> : <IconeCarteiraVazia tamanho={28} />}
          </span>

          <h3>{temFiltroAtivo ? 'Nenhuma transação com esses filtros' : 'Tudo pronto para começar'}</h3>

          <p>
            {temFiltroAtivo
              ? 'Tente mudar o tipo, a categoria ou o texto da busca.'
              : 'Cadastre a primeira receita ou despesa para ver o saldo por aqui.'}
          </p>

          {temFiltroAtivo ? (
            <button type="button" className={estilos.acaoVazio} onClick={aoLimparFiltros}>
              Limpar filtros
            </button>
          ) : (
            <button type="button" className={estilos.acaoVazio} onClick={aoNovaTransacao}>
              <IconeMais tamanho={16} />
              Nova transação
            </button>
          )}
        </div>
      ) : (
        <div className={estilos.grupos}>
          {grupos.map((grupo) => (
            <div key={grupo.chave} className={estilos.grupo}>
              <div className={estilos.cabecalhoDoGrupo}>
                <span className={estilos.dia}>{grupo.rotulo}</span>
                <span className={estilos.linhaDoGrupo} aria-hidden="true" />
                <span
                  className={classes(
                    estilos.totalDoGrupo,
                    'numero',
                    grupo.total >= 0 ? estilos.totalPositivo : estilos.totalNegativo,
                  )}
                >
                  {grupo.total >= 0 ? '+' : '-'} {formatarMoeda(grupo.total)}
                </span>
              </div>

              <ul className={estilos.lista}>
                {grupo.transacoes.map((transacao) => (
                  <ItemDeTransacao
                    key={transacao.id}
                    transacao={transacao}
                    ordem={ordemDe.get(transacao.id) ?? 0}
                    recente={idRecente === transacao.id}
                    emConfirmacao={idEmConfirmacao === transacao.id}
                    removendo={idRemovendo === transacao.id}
                    aoPedirRemocao={() => definirIdEmConfirmacao(transacao.id)}
                    aoCancelar={() => definirIdEmConfirmacao(null)}
                    aoConfirmar={() => void confirmarRemocao(transacao)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
