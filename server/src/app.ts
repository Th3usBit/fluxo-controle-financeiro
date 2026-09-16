import cors from 'cors'
import express, { type Express } from 'express'

import { env } from './config/env.js'
import { registrarRequisicoes } from './middlewares/registrar-requisicoes.js'
import { rotaNaoEncontrada } from './middlewares/rota-nao-encontrada.js'
import { tratarErros } from './middlewares/tratar-erros.js'
import type { RepositorioDeTransacoes } from './repositories/transacoes.repository.js'
import { rotas } from './routes/index.js'

/**
 * Monta o app Express. Receber o repositório por parâmetro deixa os testes
 * rodarem contra a versão em memória, sem tocar no banco de verdade.
 */
export function criarApp(repositorio: RepositorioDeTransacoes): Express {
  const app = express()

  app.use(cors({ origin: env.origensPermitidas }))
  app.use(express.json({ limit: '100kb' }))

  if (!env.ambienteDeTeste) {
    app.use(registrarRequisicoes)
  }

  app.use(rotas(repositorio))

  app.use(rotaNaoEncontrada)
  app.use(tratarErros)

  return app
}
