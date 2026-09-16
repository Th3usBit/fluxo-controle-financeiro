import type { RepositorioDeTransacoes } from '../repositories/transacoes.repository.js'

/** Transações de demonstração, para a tela não abrir vazia na primeira vez. */
const EXEMPLOS = [
  { title: 'Salário', amount: 5400, category: 'Salário', diasAtras: 14 },
  { title: 'Aluguel', amount: -1800, category: 'Moradia', diasAtras: 13 },
  { title: 'Plano de saúde', amount: -389.9, category: 'Saúde', diasAtras: 11 },
  { title: 'Supermercado do mês', amount: -742.35, category: 'Alimentação', diasAtras: 9 },
  { title: 'Freela de landing page', amount: 1250, category: 'Freelance', diasAtras: 7 },
  { title: 'Internet fibra', amount: -119.9, category: 'Moradia', diasAtras: 6 },
  { title: 'Passagem de ônibus', amount: -230, category: 'Transporte', diasAtras: 4 },
  { title: 'Venda de monitor usado', amount: 620, category: 'Vendas', diasAtras: 3 },
  { title: 'Assinatura de streaming', amount: -55.9, category: 'Lazer', diasAtras: 2 },
  { title: 'Jantar de aniversário', amount: -184.7, category: 'Alimentação', diasAtras: 1 },
]

function dataRelativa(diasAtras: number): string {
  const data = new Date()
  data.setDate(data.getDate() - diasAtras)
  return data.toISOString()
}

/**
 * Popula o banco somente quando ele está vazio, para o app abrir com conteúdo
 * na primeira execução. Desative com SEED=false.
 */
export async function popularExemplos(repositorio: RepositorioDeTransacoes): Promise<number> {
  const jaTemDados = (await repositorio.listar()).length > 0
  if (jaTemDados) return 0

  for (const { diasAtras, ...exemplo } of EXEMPLOS) {
    await repositorio.criar({ ...exemplo, createdAt: dataRelativa(diasAtras) })
  }

  return EXEMPLOS.length
}
