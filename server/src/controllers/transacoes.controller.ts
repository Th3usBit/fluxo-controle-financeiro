import type { Request, Response } from 'express'

import {
  detalhesDoErroZod,
  esquemaDeFiltros,
  esquemaDeId,
  esquemaDeNovaTransacao,
} from '../schemas/transacao.schema.js'
import { ErroDeValidacao, ErroNaoEncontrado } from '../shared/erros.js'
import type { RepositorioDeTransacoes } from '../repositories/transacoes.repository.js'
import type { FiltroDeTransacoes } from '../types/transacao.js'

/** Le os filtros da query string (?type=&category=&search=). */
export function lerFiltros(query: Request['query']): FiltroDeTransacoes {
  const resultado = esquemaDeFiltros.safeParse(query)

  if (!resultado.success) {
    throw new ErroDeValidacao(
      'Filtros inválidos.',
      detalhesDoErroZod(resultado.error),
    )
  }

  const { type, category, search } = resultado.data

  return {
    ...(type && type !== 'todas' ? { tipo: type } : {}),
    ...(category ? { categoria: category } : {}),
    ...(search ? { busca: search } : {}),
  }
}

export class TransacoesController {
  constructor(private readonly repositorio: RepositorioDeTransacoes) {}

  /** GET /transactions - lista todas as transações, com filtros opcionais. */
  listar = async (req: Request, res: Response): Promise<void> => {
    const transacoes = await this.repositorio.listar(lerFiltros(req.query))
    res.json(transacoes)
  }

  /** POST /transactions - cria uma transação. */
  criar = async (req: Request, res: Response): Promise<void> => {
    const resultado = esquemaDeNovaTransacao.safeParse(req.body)

    if (!resultado.success) {
      throw new ErroDeValidacao(
        'Não foi possível criar a transação. Confira os campos informados.',
        detalhesDoErroZod(resultado.error),
      )
    }

    const { type, ...dados } = resultado.data

    // Com "type" enviado, ele manda no sinal do valor. Sem ele, vale o sinal
    // que o cliente mandou (positivo = receita, negativo = despesa).
    const amount = type ? Math.abs(dados.amount) * (type === 'despesa' ? -1 : 1) : dados.amount

    const transacao = await this.repositorio.criar({ ...dados, amount })

    res.status(201).json(transacao)
  }

  /** DELETE /transactions/:id - remove uma transação. */
  remover = async (req: Request, res: Response): Promise<void> => {
    const resultado = esquemaDeId.safeParse(req.params.id)

    if (!resultado.success) {
      throw new ErroDeValidacao('Id inválido.', detalhesDoErroZod(resultado.error))
    }

    const removida = await this.repositorio.remover(resultado.data)

    if (!removida) {
      throw new ErroNaoEncontrado('Transação não encontrada.')
    }

    res.status(204).send()
  }

  /** GET /categories - categorias já cadastradas (extra, usado nos filtros). */
  listarCategorias = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.repositorio.listarCategorias())
  }
}
