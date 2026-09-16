'use client'

import { useCallback, useSyncExternalStore } from 'react'

export type Tema = 'claro' | 'escuro'

export const CHAVE_DO_TEMA = 'fluxo:tema'

/**
 * A fonte da verdade do tema é o atributo data-tema do <html>, escrito por um
 * script inline antes da primeira pintura (veja o layout). Aqui a gente apenas
 * lê esse valor e avisa quem estiver ouvindo quando ele muda.
 */
const ouvintes = new Set<() => void>()

function assinar(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte)

  return () => {
    ouvintes.delete(ouvinte)
  }
}

function lerDoDocumento(): Tema {
  return document.documentElement.dataset.tema === 'escuro' ? 'escuro' : 'claro'
}

function lerNoServidor(): Tema {
  return 'claro'
}

export function useTema(): { tema: Tema; alternarTema: () => void } {
  const tema = useSyncExternalStore(assinar, lerDoDocumento, lerNoServidor)

  const alternarTema = useCallback(() => {
    const proximo: Tema = lerDoDocumento() === 'claro' ? 'escuro' : 'claro'

    document.documentElement.dataset.tema = proximo

    try {
      localStorage.setItem(CHAVE_DO_TEMA, proximo)
    } catch {
      // Navegação anônima com armazenamento bloqueado: segue sem persistir.
    }

    for (const ouvinte of ouvintes) ouvinte()
  }, [])

  return { tema, alternarTema }
}
