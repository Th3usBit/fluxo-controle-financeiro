'use client'

import { useCallback, useState } from 'react'

import { BarraDeFiltros } from '@/components/barra-de-filtros'
import { Cabecalho } from '@/components/cabecalho'
import { CartoesDeResumo } from '@/components/cartoes-de-resumo'
import { Destaques } from '@/components/destaques'
import { FormularioDeTransacao } from '@/components/formulario-de-transacao'
import { GraficoDeCategorias } from '@/components/grafico-de-categorias'
import { ListaDeTransacoes } from '@/components/lista-de-transacoes'
import { Modal } from '@/components/modal'
import { useNotificacoes } from '@/components/notificacoes'
import { useTransacoes } from '@/hooks/use-transacoes'
import { MODO_LOCAL, URL_DA_API } from '@/services/api'
import { FILTROS_PADRAO, type Filtros, type NovaTransacao, type Transacao } from '@/types/transacao'
import { formatarMoeda } from '@/utils/formatar'

import estilos from './painel.module.css'

/** Tela principal: junta filtros, totais, gráfico e lista em um fluxo só. */
export function Painel() {
  const [filtros, definirFiltros] = useState<Filtros>(FILTROS_PADRAO)
  const [formularioAberto, definirFormularioAberto] = useState(false)

  const { transacoes, resumo, categorias, carregando, erro, recarregar, criar, remover } =
    useTransacoes(filtros)

  const notificacoes = useNotificacoes()

  const aoMudarFiltros = useCallback((novos: Filtros) => definirFiltros(novos), [])

  const limparFiltros = useCallback(() => definirFiltros(FILTROS_PADRAO), [])

  async function salvar(dados: NovaTransacao): Promise<void> {
    await criar(dados)

    definirFormularioAberto(false)
    notificacoes.sucesso(
      dados.type === 'receita' ? 'Receita cadastrada' : 'Despesa cadastrada',
      `${dados.title} · ${formatarMoeda(dados.amount)}`,
    )
  }

  async function excluir(transacao: Transacao): Promise<void> {
    try {
      await remover(transacao)
      notificacoes.sucesso('Transação excluída', transacao.title)
    } catch (falha) {
      notificacoes.erro(
        'Não foi possível excluir',
        falha instanceof Error ? falha.message : 'Tente novamente em instantes.',
      )
    }
  }

  const temFiltroAtivo =
    filtros.tipo !== 'todas' || filtros.categoria !== '' || filtros.busca !== ''

  return (
    <div className={estilos.pagina}>
      <Cabecalho aoNovaTransacao={() => definirFormularioAberto(true)} />

      <main className={estilos.conteudo}>
        <CartoesDeResumo resumo={resumo} carregando={carregando} />

        <BarraDeFiltros filtros={filtros} categorias={categorias} aoMudar={aoMudarFiltros} />

        <div className={estilos.grade}>
          <div className={estilos.colunaPrincipal}>
            <ListaDeTransacoes
              transacoes={transacoes}
              carregando={carregando}
              erro={erro ? erro.message : null}
              temFiltroAtivo={temFiltroAtivo}
              aoRemover={excluir}
              aoNovaTransacao={() => definirFormularioAberto(true)}
              aoLimparFiltros={limparFiltros}
              aoTentarDeNovo={recarregar}
            />
          </div>

          <aside className={estilos.colunaLateral}>
            <GraficoDeCategorias
              resumo={resumo}
              modo={filtros.tipo === 'receita' ? 'receita' : 'despesa'}
              carregando={carregando}
            />

            <Destaques transacoes={transacoes} resumo={resumo} />
          </aside>
        </div>
      </main>

      <footer className={estilos.rodape}>
        {MODO_LOCAL ? (
          <p>Fluxo · controle financeiro pessoal · seus dados ficam só neste navegador</p>
        ) : (
          <p>
            Fluxo · controle financeiro pessoal · API em{' '}
            <span className={estilos.endereco}>{URL_DA_API}</span>
          </p>
        )}
      </footer>

      <Modal
        aberto={formularioAberto}
        titulo="Nova transação"
        descricao="Escolha o tipo, informe o valor e salve. Leva dez segundos."
        aoFechar={() => definirFormularioAberto(false)}
      >
        <FormularioDeTransacao
          categorias={categorias}
          aoSalvar={salvar}
          aoCancelar={() => definirFormularioAberto(false)}
        />
      </Modal>
    </div>
  )
}
