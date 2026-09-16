'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

const DURACAO = 650
const CONSULTA = '(prefers-reduced-motion: reduce)'

function assinarPreferencia(ouvinte: () => void): () => void {
  const media = window.matchMedia(CONSULTA)
  media.addEventListener('change', ouvinte)

  return () => media.removeEventListener('change', ouvinte)
}

function suavizar(progresso: number): number {
  return 1 - Math.pow(1 - progresso, 3)
}

/**
 * Anima a transição entre dois valores para os totais não "pularem" na tela.
 * Quem pede menos animação no sistema recebe o número final direto.
 */
export function useValorAnimado(valorFinal: number): number {
  const [valor, definirValor] = useState(valorFinal)
  const valorAnterior = useRef(valorFinal)

  const menosMovimento = useSyncExternalStore(
    assinarPreferencia,
    () => window.matchMedia(CONSULTA).matches,
    () => true,
  )

  useEffect(() => {
    if (menosMovimento) {
      valorAnterior.current = valorFinal
      return
    }

    const inicio = performance.now()
    const partida = valorAnterior.current
    const distancia = valorFinal - partida
    let quadro = 0

    function passo(agora: number): void {
      const progresso = Math.min(1, (agora - inicio) / DURACAO)
      definirValor(partida + distancia * suavizar(progresso))

      if (progresso < 1) {
        quadro = requestAnimationFrame(passo)
      } else {
        valorAnterior.current = valorFinal
      }
    }

    quadro = requestAnimationFrame(passo)

    return () => cancelAnimationFrame(quadro)
  }, [valorFinal, menosMovimento])

  return menosMovimento ? valorFinal : valor
}
