'use client'

import { useId, useState, type FormEvent } from 'react'

import { IconeDespesa, IconeReceita } from '@/components/icones'
import { ErroDaApi } from '@/services/api'
import type { NovaTransacao, TipoTransacao } from '@/types/transacao'
import { classes } from '@/utils/classes'
import { aplicarMascaraDeMoeda, mascaraParaNumero } from '@/utils/formatar'

import estilos from './formulario-de-transacao.module.css'

interface Props {
  categorias: string[]
  aoSalvar: (dados: NovaTransacao) => Promise<void>
  aoCancelar: () => void
}

type Campo = 'title' | 'amount' | 'category'

type Erros = Partial<Record<Campo | 'geral', string>>

/** Atalhos de categoria para quem está cadastrando a primeira transação. */
const SUGESTOES: Record<TipoTransacao, string[]> = {
  receita: ['Salário', 'Freelance', 'Investimentos', 'Vendas'],
  despesa: ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde'],
}

export function FormularioDeTransacao({ categorias, aoSalvar, aoCancelar }: Props) {
  const [tipo, definirTipo] = useState<TipoTransacao>('despesa')
  const [titulo, definirTitulo] = useState('')
  const [valor, definirValor] = useState('')
  const [categoria, definirCategoria] = useState('')
  const [erros, definirErros] = useState<Erros>({})
  const [salvando, definirSalvando] = useState(false)

  const idTitulo = useId()
  const idValor = useId()
  const idCategoria = useId()
  const idLista = useId()

  // As categorias que a pessoa já usa vêm primeiro; as fixas só completam a lista.
  const sugestoes = [...new Set([...categorias, ...SUGESTOES[tipo]])].slice(0, 8)

  function validar(): Erros {
    const problemas: Erros = {}

    if (titulo.trim().length < 2) {
      problemas.title = 'Escreva um título com pelo menos 2 caracteres.'
    }

    if (mascaraParaNumero(valor) <= 0) {
      problemas.amount = 'Informe um valor maior que zero.'
    }

    if (categoria.trim().length < 2) {
      problemas.category = 'Informe uma categoria (ex.: Alimentação).'
    }

    return problemas
  }

  async function enviar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault()

    const problemas = validar()
    definirErros(problemas)

    if (Object.keys(problemas).length > 0) return

    definirSalvando(true)

    try {
      await aoSalvar({
        title: titulo.trim(),
        amount: mascaraParaNumero(valor),
        category: categoria.trim(),
        type: tipo,
      })
    } catch (falha) {
      if (falha instanceof ErroDaApi) {
        // A API valida de novo; se reclamar de um campo, o erro aparece nele.
        const porCampo: Erros = { geral: falha.message }

        for (const detalhe of falha.detalhes) {
          if (detalhe.campo === 'title' || detalhe.campo === 'amount' || detalhe.campo === 'category') {
            porCampo[detalhe.campo] = detalhe.mensagem
          }
        }

        definirErros(porCampo)
      } else {
        definirErros({ geral: 'Não foi possível salvar agora. Tente novamente.' })
      }
    } finally {
      definirSalvando(false)
    }
  }

  return (
    <form className={estilos.formulario} onSubmit={enviar} noValidate>
      <fieldset className={estilos.tipos}>
        <legend className="apenas-leitor-de-tela">Tipo da transação</legend>

        <button
          type="button"
          className={classes(estilos.tipo, estilos.receita, tipo === 'receita' && estilos.ativo)}
          aria-pressed={tipo === 'receita'}
          onClick={() => definirTipo('receita')}
        >
          <IconeReceita tamanho={18} />
          Receita
        </button>

        <button
          type="button"
          className={classes(estilos.tipo, estilos.despesa, tipo === 'despesa' && estilos.ativo)}
          aria-pressed={tipo === 'despesa'}
          onClick={() => definirTipo('despesa')}
        >
          <IconeDespesa tamanho={18} />
          Despesa
        </button>
      </fieldset>

      <div className={estilos.campo}>
        <label htmlFor={idValor}>Valor</label>

        <div className={classes(estilos.moeda, erros.amount && estilos.comErro)}>
          <span className={estilos.prefixo} aria-hidden="true">
            R$
          </span>

          <input
            id={idValor}
            inputMode="numeric"
            autoComplete="off"
            placeholder="0,00"
            value={valor}
            onChange={(evento) => definirValor(aplicarMascaraDeMoeda(evento.target.value))}
            aria-invalid={Boolean(erros.amount)}
            aria-describedby={erros.amount ? `${idValor}-erro` : undefined}
            className={classes(estilos.entradaDeValor, 'numero')}
          />
        </div>

        {erros.amount ? (
          <p id={`${idValor}-erro`} className={estilos.mensagemDeErro}>
            {erros.amount}
          </p>
        ) : null}
      </div>

      <div className={estilos.campo}>
        <label htmlFor={idTitulo}>Título</label>

        <input
          id={idTitulo}
          type="text"
          maxLength={60}
          autoComplete="off"
          placeholder="Ex.: Mercado do mês"
          value={titulo}
          onChange={(evento) => definirTitulo(evento.target.value)}
          aria-invalid={Boolean(erros.title)}
          aria-describedby={erros.title ? `${idTitulo}-erro` : undefined}
          className={classes(estilos.entrada, erros.title && estilos.comErro)}
        />

        {erros.title ? (
          <p id={`${idTitulo}-erro`} className={estilos.mensagemDeErro}>
            {erros.title}
          </p>
        ) : null}
      </div>

      <div className={estilos.campo}>
        <label htmlFor={idCategoria}>Categoria</label>

        <input
          id={idCategoria}
          type="text"
          maxLength={40}
          autoComplete="off"
          list={idLista}
          placeholder="Ex.: Alimentação"
          value={categoria}
          onChange={(evento) => definirCategoria(evento.target.value)}
          aria-invalid={Boolean(erros.category)}
          aria-describedby={erros.category ? `${idCategoria}-erro` : undefined}
          className={classes(estilos.entrada, erros.category && estilos.comErro)}
        />

        <datalist id={idLista}>
          {sugestoes.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>

        {erros.category ? (
          <p id={`${idCategoria}-erro`} className={estilos.mensagemDeErro}>
            {erros.category}
          </p>
        ) : null}

        <div className={estilos.sugestoes}>
          {sugestoes.slice(0, 5).map((item) => (
            <button
              key={item}
              type="button"
              className={classes(estilos.sugestao, categoria === item && estilos.sugestaoAtiva)}
              onClick={() => definirCategoria(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {erros.geral ? (
        <p className={estilos.erroGeral} role="alert">
          {erros.geral}
        </p>
      ) : null}

      <footer className={estilos.acoes}>
        <button type="button" className={estilos.cancelar} onClick={aoCancelar}>
          Cancelar
        </button>

        <button
          type="submit"
          className={classes(estilos.salvar, estilos[`salvar${tipo === 'receita' ? 'Receita' : 'Despesa'}`])}
          disabled={salvando}
        >
          {salvando ? 'Salvando...' : `Salvar ${tipo}`}
        </button>
      </footer>
    </form>
  )
}
