import type { Request, Response } from 'express'

/** Responde 404 em JSON para qualquer rota que não existe. */
export function rotaNaoEncontrada(req: Request, res: Response): void {
  res.status(404).json({
    erro: { mensagem: `Rota não encontrada: ${req.method} ${req.originalUrl}` },
  })
}
