import type {
  DadosDeNovaTransacao,
  FiltroDeTransacoes,
  Transacao,
} from '../types/transacao.js'

/**
 * Contrato de acesso a dados. Os controllers dependem só desta interface, entao
 * trocar SQLite por memória (ou por outro banco no futuro) não mexe nas rotas.
 */
export interface RepositorioDeTransacoes {
  listar(filtro?: FiltroDeTransacoes): Promise<Transacao[]>
  buscarPorId(id: string): Promise<Transacao | null>
  criar(dados: DadosDeNovaTransacao): Promise<Transacao>
  remover(id: string): Promise<boolean>
  listarCategorias(): Promise<string[]>
}

/** Comparação usada nos filtros: ignora acentos, espaços e caixa. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
}

/** Ordena da transação mais recente para a mais antiga. */
export function daMaisRecente(a: Transacao, b: Transacao): number {
  return b.createdAt.localeCompare(a.createdAt)
}
