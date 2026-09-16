'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'

import { IconeFechar } from '@/components/icones'

import estilos from './modal.module.css'

interface Props {
  aberto: boolean
  titulo: string
  descricao?: string
  aoFechar: () => void
  children: ReactNode
}

/**
 * Janela modal acessível: fecha no Esc e no clique de fora, prende o Tab dentro
 * do conteúdo, trava a rolagem do fundo e devolve o foco para quem a abriu.
 */
export function Modal({ aberto, titulo, descricao, aoFechar, children }: Props) {
  const caixa = useRef<HTMLDivElement>(null)
  const focoAnterior = useRef<HTMLElement | null>(null)
  const idDoTitulo = useId()
  const idDaDescricao = useId()

  useEffect(() => {
    if (!aberto) return

    focoAnterior.current = document.activeElement as HTMLElement | null

    const rolagemOriginal = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Foca o primeiro campo (e não o "fechar") assim que a janela abre.
    const primeiroCampo =
      caixa.current?.querySelector<HTMLElement>('input:not(:disabled), select, textarea') ??
      caixa.current?.querySelector<HTMLElement>('button:not(:disabled)')

    primeiroCampo?.focus()

    function aoTeclar(evento: KeyboardEvent): void {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        aoFechar()
        return
      }

      if (evento.key !== 'Tab' || !caixa.current) return

      const focaveis = [
        ...caixa.current.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      ]

      if (focaveis.length === 0) return

      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault()
        ultimo?.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primeiro?.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar)

    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = rolagemOriginal
      focoAnterior.current?.focus()
    }
  }, [aberto, aoFechar])

  if (!aberto) return null

  return (
    <div
      className={estilos.fundo}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar()
      }}
    >
      <div
        ref={caixa}
        className={estilos.caixa}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idDoTitulo}
        aria-describedby={descricao ? idDaDescricao : undefined}
      >
        <header className={estilos.topo}>
          <div>
            <h2 id={idDoTitulo} className={estilos.titulo}>
              {titulo}
            </h2>
            {descricao ? (
              <p id={idDaDescricao} className={estilos.descricao}>
                {descricao}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            className={estilos.fechar}
            onClick={aoFechar}
            aria-label="Fechar janela"
          >
            <IconeFechar tamanho={18} />
          </button>
        </header>

        <div className={estilos.corpo}>{children}</div>
      </div>
    </div>
  )
}
