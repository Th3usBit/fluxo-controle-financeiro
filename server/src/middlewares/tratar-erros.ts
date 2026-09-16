import type { NextFunction, Request, Response } from 'express'

import { ErroDaAplicacao } from '../shared/erros.js'

/** Erro com o formato que o front sabe ler. */
interface CorpoDeErro {
  erro: {
    mensagem: string
    detalhes?: Array<{ campo: string; mensagem: string }>
  }
}

function ehJsonMalformado(erro: unknown): boolean {
  return erro instanceof SyntaxError && 'body' in erro
}

/**
 * Último middleware da cadeia: transforma qualquer erro em uma resposta JSON
 * consistente. No Express 5, promises rejeitadas nos handlers chegam aqui.
 */
export function tratarErros(
  erro: unknown,
  _req: Request,
  res: Response,
  proximo: NextFunction,
): void {
  if (res.headersSent) {
    proximo(erro)
    return
  }

  if (erro instanceof ErroDaAplicacao) {
    const corpo: CorpoDeErro = { erro: { mensagem: erro.message } }
    if (erro.detalhes.length > 0) corpo.erro.detalhes = erro.detalhes

    res.status(erro.status).json(corpo)
    return
  }

  if (ehJsonMalformado(erro)) {
    res.status(400).json({
      erro: { mensagem: 'O corpo da requisição não é um JSON válido.' },
    } satisfies CorpoDeErro)
    return
  }

  console.error('[fluxo] erro inesperado:', erro)

  res.status(500).json({
    erro: { mensagem: 'Erro inesperado no servidor. Tente novamente em instantes.' },
  } satisfies CorpoDeErro)
}
