import { Router } from 'express'

import type { RepositorioDeTransacoes } from '../repositories/transacoes.repository.js'
import { rotasDeResumo } from './resumo.routes.js'
import { rotasDeTransacoes } from './transacoes.routes.js'

/** Junta todas as rotas da API em um único router. */
export function rotas(repositorio: RepositorioDeTransacoes): Router {
  const rotas = Router()

  rotas.get('/health', (_req, res) => {
    res.json({ status: 'ok', servico: 'fluxo-api', horario: new Date().toISOString() })
  })

  rotas.use(rotasDeTransacoes(repositorio))
  rotas.use(rotasDeResumo(repositorio))

  return rotas
}
