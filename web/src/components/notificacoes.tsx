'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { IconeAlerta, IconeConfirmado, IconeFechar } from '@/components/icones'
import { classes } from '@/utils/classes'

import estilos from './notificacoes.module.css'

type TipoDeNotificacao = 'sucesso' | 'erro'

interface Notificacao {
  id: number
  tipo: TipoDeNotificacao
  mensagem: string
  descricao?: string
}

interface ApiDeNotificacoes {
  sucesso: (mensagem: string, descricao?: string) => void
  erro: (mensagem: string, descricao?: string) => void
}

const TEMPO_NA_TELA = 4500

const Contexto = createContext<ApiDeNotificacoes | null>(null)

/** Avisos curtos no canto da tela, para confirmar ou explicar o que aconteceu. */
export function ProvedorDeNotificacoes({ children }: { children: ReactNode }) {
  const [notificacoes, definirNotificacoes] = useState<Notificacao[]>([])

  const remover = useCallback((id: number) => {
    definirNotificacoes((lista) => lista.filter((item) => item.id !== id))
  }, [])

  const adicionar = useCallback(
    (tipo: TipoDeNotificacao, mensagem: string, descricao?: string) => {
      const id = Date.now() + Math.random()

      definirNotificacoes((lista) => [...lista.slice(-2), { id, tipo, mensagem, descricao }])
      setTimeout(() => remover(id), TEMPO_NA_TELA)
    },
    [remover],
  )

  const api = useMemo<ApiDeNotificacoes>(
    () => ({
      sucesso: (mensagem, descricao) => adicionar('sucesso', mensagem, descricao),
      erro: (mensagem, descricao) => adicionar('erro', mensagem, descricao),
    }),
    [adicionar],
  )

  return (
    <Contexto.Provider value={api}>
      {children}

      <div className={estilos.area} role="status" aria-live="polite">
        {notificacoes.map((notificacao) => (
          <article
            key={notificacao.id}
            className={classes(estilos.notificacao, estilos[notificacao.tipo])}
          >
            <span className={estilos.icone}>
              {notificacao.tipo === 'sucesso' ? (
                <IconeConfirmado tamanho={20} />
              ) : (
                <IconeAlerta tamanho={20} />
              )}
            </span>

            <div className={estilos.texto}>
              <strong>{notificacao.mensagem}</strong>
              {notificacao.descricao ? <p>{notificacao.descricao}</p> : null}
            </div>

            <button
              type="button"
              className={estilos.fechar}
              onClick={() => remover(notificacao.id)}
              aria-label="Fechar aviso"
            >
              <IconeFechar tamanho={16} />
            </button>
          </article>
        ))}
      </div>
    </Contexto.Provider>
  )
}

export function useNotificacoes(): ApiDeNotificacoes {
  const contexto = useContext(Contexto)

  if (!contexto) {
    throw new Error('useNotificacoes precisa estar dentro de <ProvedorDeNotificacoes>.')
  }

  return contexto
}
