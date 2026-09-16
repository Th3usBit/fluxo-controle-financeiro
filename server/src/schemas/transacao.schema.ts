import * as z from 'zod'

import type { DetalheDeErro } from '../shared/erros.js'

// Mensagens padrão do Zod em português; cada campo ainda traz um texto próprio,
// mais amigavel para quem está preenchendo o formulário.
z.config(z.locales.ptBR())

const VALOR_MAXIMO = 1_000_000_000

/** Aceita número ou texto numérico ("1234.56" e "1234,56"). */
const valorMonetario = z.preprocess((valor) => {
  if (typeof valor !== 'string') return valor

  const normalizado = valor.trim().replace(/\s/g, '').replace(',', '.')
  if (normalizado === '') return valor

  const convertido = Number(normalizado)
  return Number.isNaN(convertido) ? valor : convertido
}, z
  .number({ error: 'Informe o valor da transação em números.' })
  .refine((valor) => Number.isFinite(valor), { error: 'Informe um valor numérico válido.' })
  .refine((valor) => valor !== 0, { error: 'O valor precisa ser diferente de zero.' })
  .refine((valor) => Math.abs(valor) <= VALOR_MAXIMO, {
    error: 'O valor informado é alto demais.',
  })
  .refine((valor) => Math.abs(valor * 100 - Math.round(valor * 100)) < 1e-6, {
    error: 'Use no máximo duas casas decimais.',
  }))

export const esquemaDeNovaTransacao = z.strictObject({
  title: z
    .string({ error: 'Informe o título da transação.' })
    .trim()
    .min(2, { error: 'O título precisa ter pelo menos 2 caracteres.' })
    .max(60, { error: 'O título pode ter no máximo 60 caracteres.' }),

  amount: valorMonetario,

  category: z
    .string({ error: 'Informe a categoria da transação.' })
    .trim()
    .min(2, { error: 'A categoria precisa ter pelo menos 2 caracteres.' })
    .max(40, { error: 'A categoria pode ter no máximo 40 caracteres.' }),

  /**
   * Opcional. Quando enviado, manda no sinal do valor: "despesa" guarda o
   * número negativo mesmo que o cliente mande 50, e "receita" guarda positivo.
   * Evita o erro classico de cadastrar despesa com valor positivo.
   */
  type: z
    .enum(['receita', 'despesa'], { error: 'O tipo precisa ser "receita" ou "despesa".' })
    .optional(),
})

export const esquemaDeFiltros = z.object({
  type: z.enum(['receita', 'despesa', 'todas']).optional(),
  category: z.string().trim().max(40).optional(),
  search: z.string().trim().max(60).optional(),
})

export const esquemaDeId = z
  .string({ error: 'Informe o id da transação.' })
  .trim()
  .min(1, { error: 'Informe o id da transação.' })

export type EntradaDeNovaTransacao = z.infer<typeof esquemaDeNovaTransacao>
export type EntradaDeFiltros = z.infer<typeof esquemaDeFiltros>

/** Traduz os problemas do Zod para a lista de detalhes devolvida pela API. */
export function detalhesDoErroZod(erro: z.ZodError): DetalheDeErro[] {
  return erro.issues.map((problema) => {
    const campo = problema.path.join('.') || 'corpo da requisição'

    if (problema.code === 'unrecognized_keys') {
      return {
        campo: problema.keys.join(', '),
        mensagem: 'Campo não reconhecido. Envie apenas title, amount, category e type.',
      }
    }

    return { campo, mensagem: problema.message }
  })
}
