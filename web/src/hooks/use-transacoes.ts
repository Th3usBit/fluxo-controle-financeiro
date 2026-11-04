'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { api, ErroDaApi } from '@/services/api'
import type { Filtros, NovaTransacao, Resumo, Transacao } from '@/types/transacao'

/**
 * Última mudança feita pela pessoa (lançar ou excluir). Alimenta as animações
 * de impacto: qual cartão reage, com qual valor e qual linha chegou.
 */
export interface Mudanca {
  /** Muda a cada ação, para a animação tocar de novo mesmo com valor igual. */
  chave: number
  transacaoId: string
  /** Valor da transação: positivo = receita, negativo = despesa. */
  amount: number
  /** 1 = entrou na lista, -1 = saiu. */
  sentido: 1 | -1
}

interface EstadoDasTransacoes {
  transacoes: Transacao[]
  resumo: Resumo | null
  categorias: string[]
  carregando: boolean
  erro: ErroDaApi | null
  mudanca: Mudanca | null
  recarregar: () => void
  criar: (dados: NovaTransacao) => Promise<Transacao>
  remover: (transacao: Transacao) => Promise<void>
}

const RESUMO_VAZIO: Resumo = {
  income: 0,
  expenses: 0,
  balance: 0,
  transactions: 0,
  byCategory: [],
}

function ehCancelamento(erro: unknown): boolean {
  return erro instanceof DOMException && erro.name === 'AbortError'
}

/**
 * Concentra o acesso à API em um lugar só: lista, resumo e categorias sempre
 * chegam juntos, então os cartões nunca mostram um total que não bate com a
 * lista logo abaixo.
 */
export function useTransacoes(filtros: Filtros): EstadoDasTransacoes {
  const [transacoes, definirTransacoes] = useState<Transacao[]>([])
  const [resumo, definirResumo] = useState<Resumo | null>(null)
  const [categorias, definirCategorias] = useState<string[]>([])
  const [carregando, definirCarregando] = useState(true)
  const [erro, definirErro] = useState<ErroDaApi | null>(null)
  const [mudanca, definirMudanca] = useState<Mudanca | null>(null)

  // Usado para descartar respostas de requisições antigas (filtro digitado rápido).
  const requisicaoAtual = useRef<AbortController | null>(null)
  const [gatilho, definirGatilho] = useState(0)

  const { tipo, categoria, busca } = filtros

  useEffect(() => {
    const controlador = new AbortController()
    requisicaoAtual.current?.abort()
    requisicaoAtual.current = controlador

    async function carregar(): Promise<void> {
      definirCarregando(true)

      try {
        const filtrosAtuais = { tipo, categoria, busca }

        const [listaCarregada, resumoCarregado, categoriasCarregadas] = await Promise.all([
          api.listarTransacoes(filtrosAtuais, controlador.signal),
          api.obterResumo(filtrosAtuais, controlador.signal),
          api.listarCategorias(controlador.signal),
        ])

        definirTransacoes(listaCarregada)
        definirResumo(resumoCarregado)
        definirCategorias(categoriasCarregadas)
        definirErro(null)
      } catch (falha) {
        if (ehCancelamento(falha)) return

        definirErro(
          falha instanceof ErroDaApi
            ? falha
            : new ErroDaApi('Erro inesperado ao carregar os dados.'),
        )
        definirTransacoes([])
        definirResumo(RESUMO_VAZIO)
      } finally {
        if (!controlador.signal.aborted) definirCarregando(false)
      }
    }

    void carregar()

    return () => controlador.abort()
  }, [tipo, categoria, busca, gatilho])

  const recarregar = useCallback(() => definirGatilho((valor) => valor + 1), [])

  const criar = useCallback(
    async (dados: NovaTransacao): Promise<Transacao> => {
      const criada = await api.criarTransacao(dados)
      definirMudanca({ chave: Date.now(), transacaoId: criada.id, amount: criada.amount, sentido: 1 })
      recarregar()
      return criada
    },
    [recarregar],
  )

  const remover = useCallback(
    async (transacao: Transacao): Promise<void> => {
      // Remoção otimista: a linha some na hora e volta se a API recusar.
      definirTransacoes((lista) => lista.filter((item) => item.id !== transacao.id))

      try {
        await api.removerTransacao(transacao.id)
        definirMudanca({
          chave: Date.now(),
          transacaoId: transacao.id,
          amount: transacao.amount,
          sentido: -1,
        })
        recarregar()
      } catch (falha) {
        definirTransacoes((lista) =>
          [...lista, transacao].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        )
        throw falha
      }
    },
    [recarregar],
  )

  return {
    transacoes,
    resumo,
    categorias,
    carregando,
    erro,
    mudanca,
    recarregar,
    criar,
    remover,
  }
}
