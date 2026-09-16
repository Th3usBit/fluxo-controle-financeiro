import { criarApp } from './app.js'
import { env } from './config/env.js'
import { abrirBanco } from './database/conexao.js'
import { popularExemplos } from './database/exemplos.js'
import { RepositorioDeTransacoesEmMemoria } from './repositories/memoria-transacoes.repository.js'
import { RepositorioDeTransacoesSqlite } from './repositories/sqlite-transacoes.repository.js'
import type { RepositorioDeTransacoes } from './repositories/transacoes.repository.js'

function criarRepositorio(): { repositorio: RepositorioDeTransacoes; descricao: string } {
  if (env.armazenamento === 'memoria') {
    return {
      repositorio: new RepositorioDeTransacoesEmMemoria(),
      descricao: 'memória (os dados somem quando o servidor para)',
    }
  }

  const banco = abrirBanco(env.arquivoDoBanco)

  return {
    repositorio: new RepositorioDeTransacoesSqlite(banco),
    descricao: `SQLite (${env.arquivoDoBanco})`,
  }
}

async function iniciar(): Promise<void> {
  const { repositorio, descricao } = criarRepositorio()

  if (process.env.SEED !== 'false') {
    const criadas = await popularExemplos(repositorio)
    if (criadas > 0) {
      console.log(`Banco vazio: ${criadas} transações de exemplo foram criadas.`)
    }
  }

  const app = criarApp(repositorio)

  app.listen(env.porta, () => {
    console.log('')
    console.log('  Fluxo - API de controle financeiro')
    console.log(`  Rodando em     http://localhost:${env.porta}`)
    console.log(`  Armazenamento  ${descricao}`)
    console.log(`  CORS liberado  ${env.origensPermitidas.join(', ')}`)
    console.log('')
  })
}

iniciar().catch((erro) => {
  console.error('Não foi possível iniciar a API:', erro)
  process.exit(1)
})
