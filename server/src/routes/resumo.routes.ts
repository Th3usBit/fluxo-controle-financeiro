import { Router } from 'express'

import { ResumoController } from '../controllers/resumo.controller.js'
import type { RepositorioDeTransacoes } from '../repositories/transacoes.repository.js'

export function rotasDeResumo(repositorio: RepositorioDeTransacoes): Router {
  const rotas = Router()
  const controller = new ResumoController(repositorio)

  rotas.get('/summary', controller.obter)

  return rotas
}
