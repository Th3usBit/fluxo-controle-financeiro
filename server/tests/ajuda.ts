import type { Express } from 'express'

import { criarApp } from '../src/app.js'
import { RepositorioDeTransacoesEmMemoria } from '../src/repositories/memoria-transacoes.repository.js'

/** Cria um app isolado, com repositório em memória, para cada teste. */
export function criarAppDeTeste(): Express {
  return criarApp(new RepositorioDeTransacoesEmMemoria())
}
