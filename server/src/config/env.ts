/** Configuração lida do ambiente, com valores padrão para rodar sem .env. */

function numero(valor: string | undefined, padrao: number): number {
  const convertido = Number(valor)
  return Number.isFinite(convertido) && convertido > 0 ? convertido : padrao
}

export const env = {
  /** Porta da API. O front espera 3333 por padrão. */
  porta: numero(process.env.PORT, 3333),

  /** Origens liberadas no CORS (separadas por virgula). */
  origensPermitidas: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origem) => origem.trim())
    .filter(Boolean),

  /** "SQLite" guarda em disco; "memória" mantem tudo em um array. */
  armazenamento: (process.env.STORAGE ?? 'sqlite') === 'memoria' ? 'memoria' : 'sqlite',

  /** Caminho do arquivo SQLite, criado automaticamente na primeira execução. */
  arquivoDoBanco: process.env.DATABASE_FILE ?? 'data/fluxo.db',

  get ambienteDeTeste(): boolean {
    return process.env.NODE_ENV === 'test'
  },
} as const
