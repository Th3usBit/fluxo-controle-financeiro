import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import Database from 'better-sqlite3'

import { normalizar } from '../repositories/transacoes.repository.js'

export type BancoDeDados = Database.Database

const MIGRACAO = `
  CREATE TABLE IF NOT EXISTS transacoes (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    amount      REAL NOT NULL,
    category    TEXT NOT NULL,
    created_at  TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_transacoes_created_at ON transacoes (created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_transacoes_category   ON transacoes (category);
`

/**
 * Abre (ou cria) o banco SQLite, garante a pasta e aplica a migração.
 * Tudo acontece na primeira execução: não existe passo manual de setup.
 */
export function abrirBanco(caminho: string): BancoDeDados {
  const caminhoAbsoluto = caminho === ':memory:' ? caminho : resolve(process.cwd(), caminho)

  if (caminhoAbsoluto !== ':memory:') {
    mkdirSync(dirname(caminhoAbsoluto), { recursive: true })
  }

  const banco = new Database(caminhoAbsoluto)

  banco.pragma('journal_mode = WAL')
  banco.pragma('foreign_keys = ON')

  // Deixa o SQL usar a mesma normalização do resto do código (sem acento e sem
  // diferenca de maiusculas), para o filtro por categoria bater com o da UI.
  banco.function('normalizar', (texto: unknown) =>
    typeof texto === 'string' ? normalizar(texto) : '',
  )

  banco.exec(MIGRACAO)

  return banco
}
