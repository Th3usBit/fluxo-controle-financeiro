/** Formatação de dinheiro, datas e textos - sempre em pt-BR. */

const MOEDA = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const MOEDA_SEM_SIMBOLO = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const DATA_COMPLETA = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const DATA_CURTA = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

const HORA = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

/** R$ 1.234,56 - sempre em valor absoluto, o sinal é responsabilidade da UI. */
export function formatarMoeda(valor: number): string {
  return MOEDA.format(Math.abs(valor))
}

/** Igual ao anterior, mas com o sinal na frente (+ ou -). */
export function formatarMoedaComSinal(valor: number): string {
  const sinal = valor < 0 ? '-' : '+'
  return `${sinal} ${MOEDA.format(Math.abs(valor))}`
}

/** 1.234,56 (sem o "R$"), usado no campo de valor do formulário. */
export function formatarNumero(valor: number): string {
  return MOEDA_SEM_SIMBOLO.format(Math.abs(valor))
}

export function formatarDataCompleta(iso: string): string {
  return DATA_COMPLETA.format(new Date(iso))
}

export function formatarDataCurta(iso: string): string {
  return DATA_CURTA.format(new Date(iso)).replace('.', '')
}

export function formatarHora(iso: string): string {
  return HORA.format(new Date(iso))
}

/** Chave "aaaa-mm-dd" usada para agrupar transações por dia. */
export function chaveDoDia(iso: string): string {
  const data = new Date(iso)
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

/** "Hoje", "Ontem" ou a data por extenso. */
export function rotuloDoDia(iso: string): string {
  const hoje = chaveDoDia(new Date().toISOString())

  const ontemData = new Date()
  ontemData.setDate(ontemData.getDate() - 1)
  const ontem = chaveDoDia(ontemData.toISOString())

  const dia = chaveDoDia(iso)

  if (dia === hoje) return 'Hoje'
  if (dia === ontem) return 'Ontem'

  return formatarDataCompleta(iso)
}

/** Duas letras para o avatar da categoria: "Alimentação" vira "AL". */
export function iniciaisDaCategoria(categoria: string): string {
  const palavras = categoria.trim().split(/\s+/).filter(Boolean)

  if (palavras.length === 0) return '??'
  if (palavras.length === 1) return (palavras[0] ?? '').slice(0, 2).toUpperCase()

  return `${palavras[0]?.[0] ?? ''}${palavras[1]?.[0] ?? ''}`.toUpperCase()
}

/**
 * Máscara de moeda para digitação: o usuário só digita números e o valor vai
 * preenchendo da direita para a esquerda (1 -> 0,01 -> 0,12 -> 1,23).
 */
export function aplicarMascaraDeMoeda(texto: string): string {
  const somenteDigitos = texto.replace(/\D/g, '').slice(0, 12)

  if (somenteDigitos === '') return ''

  const centavos = Number(somenteDigitos)
  return MOEDA_SEM_SIMBOLO.format(centavos / 100)
}

/** Converte o texto mascarado de volta para número (1.234,56 -> 1234.56). */
export function mascaraParaNumero(texto: string): number {
  const somenteDigitos = texto.replace(/\D/g, '')
  if (somenteDigitos === '') return 0

  return Number(somenteDigitos) / 100
}

/** Porcentagem inteira, protegida contra divisão por zero. */
export function porcentagem(parte: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((parte / total) * 100))
}

/** "3 transações" / "1 transação" - plural sem gambiarra no JSX. */
export function pluralizar(quantidade: number, singular: string, plural: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`
}
