import type { Request, Response } from 'express'

import { calcularResumo } from '../shared/resumo.js'
import type { RepositorioDeTransacoes } from '../repositories/transacoes.repository.js'
import { lerFiltros } from './transacoes.controller.js'

export class ResumoController {
  constructor(private readonly repositorio: RepositorioDeTransacoes) {}

  /**
   * GET /summary - receitas, despesas e saldo.
   * Aceita os mesmos filtros da listagem, entao os totais da tela sempre
   * batem com as transações que estão sendo exibidas.
   */
  obter = async (req: Request, res: Response): Promise<void> => {
    const transacoes = await this.repositorio.listar(lerFiltros(req.query))
    res.json(calcularResumo(transacoes))
  }
}
