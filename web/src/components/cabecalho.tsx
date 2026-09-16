'use client'

import { IconeFluxo, IconeLua, IconeMais, IconeSol } from '@/components/icones'
import { useTema } from '@/hooks/use-tema'

import estilos from './cabecalho.module.css'

interface Props {
  aoNovaTransacao: () => void
}

export function Cabecalho({ aoNovaTransacao }: Props) {
  const { tema, alternarTema } = useTema()

  return (
    <header className={estilos.cabecalho}>
      <div className={estilos.conteudo}>
        <div className={estilos.marca}>
          <span className={estilos.logo} aria-hidden="true">
            <IconeFluxo tamanho={22} />
          </span>

          <div>
            <h1 className={estilos.titulo}>Fluxo</h1>
            <p className={estilos.subtitulo}>Controle financeiro pessoal</p>
          </div>
        </div>

        <div className={estilos.acoes}>
          <button
            type="button"
            className={estilos.botaoDeTema}
            onClick={alternarTema}
            aria-label={tema === 'claro' ? 'Ativar tema escuro' : 'Ativar tema claro'}
            title={tema === 'claro' ? 'Ativar tema escuro' : 'Ativar tema claro'}
          >
            {tema === 'claro' ? <IconeLua tamanho={18} /> : <IconeSol tamanho={18} />}
          </button>

          <button type="button" className={estilos.botaoPrincipal} onClick={aoNovaTransacao}>
            <IconeMais tamanho={18} />
            <span>Nova transação</span>
          </button>
        </div>
      </div>
    </header>
  )
}
