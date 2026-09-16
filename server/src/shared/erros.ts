/** Erros da aplicação: sempre carregam status HTTP e mensagem em português. */

export interface DetalheDeErro {
  campo: string
  mensagem: string
}

export class ErroDaAplicacao extends Error {
  readonly status: number
  readonly detalhes: DetalheDeErro[]

  constructor(mensagem: string, status = 400, detalhes: DetalheDeErro[] = []) {
    super(mensagem)
    this.name = new.target.name
    this.status = status
    this.detalhes = detalhes
  }
}

/** 400 - o cliente mandou dados inválidos ou incompletos. */
export class ErroDeValidacao extends ErroDaAplicacao {
  constructor(mensagem: string, detalhes: DetalheDeErro[] = []) {
    super(mensagem, 400, detalhes)
  }
}

/** 404 - o recurso pedido não existe. */
export class ErroNaoEncontrado extends ErroDaAplicacao {
  constructor(mensagem = 'Recurso não encontrado.') {
    super(mensagem, 404)
  }
}
