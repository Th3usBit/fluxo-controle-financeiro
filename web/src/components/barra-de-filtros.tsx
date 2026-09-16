'use client'

import { useEffect, useState } from 'react'

import { IconeBusca, IconeFechar } from '@/components/icones'
import type { FiltroDeTipo, Filtros } from '@/types/transacao'
import { classes } from '@/utils/classes'

import estilos from './barra-de-filtros.module.css'

interface Props {
  filtros: Filtros
  categorias: string[]
  aoMudar: (filtros: Filtros) => void
}

const TIPOS: Array<{ valor: FiltroDeTipo; rotulo: string }> = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'receita', rotulo: 'Receitas' },
  { valor: 'despesa', rotulo: 'Despesas' },
]

const ESPERA_DA_BUSCA = 320

export function BarraDeFiltros({ filtros, categorias, aoMudar }: Props) {
  // O campo responde na hora; a API só é chamada quando a digitação para.
  const [busca, definirBusca] = useState(filtros.busca)
  const [buscaDoPai, definirBuscaDoPai] = useState(filtros.busca)

  // Quando os filtros são limpos lá fora, o campo acompanha. Ajustar o estado
  // durante o render (em vez de num efeito) evita um render extra a cada troca.
  if (filtros.busca !== buscaDoPai) {
    definirBuscaDoPai(filtros.busca)
    definirBusca(filtros.busca)
  }

  useEffect(() => {
    if (busca === filtros.busca) return

    const tempo = setTimeout(() => aoMudar({ ...filtros, busca }), ESPERA_DA_BUSCA)
    return () => clearTimeout(tempo)
  }, [busca, filtros, aoMudar])

  const temFiltro = filtros.tipo !== 'todas' || filtros.categoria !== '' || filtros.busca !== ''

  return (
    <section className={estilos.barra} aria-label="Filtros">
      <div className={estilos.campoDeBusca}>
        <IconeBusca tamanho={18} />

        <input
          type="search"
          value={busca}
          onChange={(evento) => definirBusca(evento.target.value)}
          placeholder="Buscar por título..."
          aria-label="Buscar transações pelo título"
          className={estilos.entrada}
        />

        {busca ? (
          <button
            type="button"
            className={estilos.limparBusca}
            onClick={() => definirBusca('')}
            aria-label="Limpar busca"
          >
            <IconeFechar tamanho={14} />
          </button>
        ) : null}
      </div>

      <div className={estilos.grupoDeTipos} role="group" aria-label="Filtrar por tipo">
        {TIPOS.map((tipo) => (
          <button
            key={tipo.valor}
            type="button"
            className={classes(estilos.chip, filtros.tipo === tipo.valor && estilos.chipAtivo)}
            aria-pressed={filtros.tipo === tipo.valor}
            onClick={() => aoMudar({ ...filtros, tipo: tipo.valor })}
          >
            {tipo.rotulo}
          </button>
        ))}
      </div>

      <div className={estilos.campoDeCategoria}>
        <label htmlFor="filtro-categoria" className="apenas-leitor-de-tela">
          Filtrar por categoria
        </label>

        <select
          id="filtro-categoria"
          className={estilos.selecao}
          value={filtros.categoria}
          onChange={(evento) => aoMudar({ ...filtros, categoria: evento.target.value })}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      {temFiltro ? (
        <button
          type="button"
          className={estilos.limparTudo}
          onClick={() => aoMudar({ tipo: 'todas', categoria: '', busca: '' })}
        >
          Limpar filtros
        </button>
      ) : null}
    </section>
  )
}
