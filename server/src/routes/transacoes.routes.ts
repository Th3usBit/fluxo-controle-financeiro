import { Router } from 'express'

import { TransacoesController } from '../controllers/transacoes.controller.js'
import type { RepositorioDeTransacoes } from '../repositories/transacoes.repository.js'

export function rotasDeTransacoes(repositorio: RepositorioDeTransacoes): Router {
  const rotas = Router()
  const controller = new TransacoesController(repositorio)

  rotas.get('/transactions', controller.listar)
  rotas.post('/transactions', controller.criar)
  rotas.delete('/transactions/:id', controller.remover)

  // Extra: alimenta o filtro por categoria da interface.
  rotas.get('/categories', controller.listarCategorias)

  return rotas
}
