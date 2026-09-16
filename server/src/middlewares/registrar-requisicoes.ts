import type { NextFunction, Request, Response } from 'express'

/** Log simples de cada requisição: metodo, rota, status e duração. */
export function registrarRequisicoes(req: Request, res: Response, proximo: NextFunction): void {
  const inicio = performance.now()

  res.on('finish', () => {
    const duracao = (performance.now() - inicio).toFixed(0)
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${duracao}ms)`)
  })

  proximo()
}
