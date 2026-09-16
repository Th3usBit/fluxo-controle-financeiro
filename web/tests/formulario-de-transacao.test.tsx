import { render, screen } from '@testing-library/react'
import usuario from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FormularioDeTransacao } from '@/components/formulario-de-transacao'
import { ErroDaApi } from '@/services/api'

function montar(aoSalvar = vi.fn().mockResolvedValue(undefined)) {
  const aoCancelar = vi.fn()

  render(
    <FormularioDeTransacao
      categorias={['Mercado']}
      aoSalvar={aoSalvar}
      aoCancelar={aoCancelar}
    />,
  )

  return { aoSalvar, aoCancelar }
}

describe('<FormularioDeTransacao />', () => {
  it('reclama dos campos vazios em vez de chamar a API', async () => {
    const { aoSalvar } = montar()

    await usuario.click(screen.getByRole('button', { name: /salvar/i }))

    expect(await screen.findByText('Informe um valor maior que zero.')).toBeInTheDocument()
    expect(screen.getByText('Escreva um título com pelo menos 2 caracteres.')).toBeInTheDocument()
    expect(aoSalvar).not.toHaveBeenCalled()
  })

  it('envia despesa com os dados já normalizados', async () => {
    const { aoSalvar } = montar()

    await usuario.type(screen.getByLabelText('Valor'), '12350')
    await usuario.type(screen.getByLabelText('Título'), '  Mercado do mês  ')
    await usuario.type(screen.getByLabelText('Categoria'), 'Alimentação')

    await usuario.click(screen.getByRole('button', { name: /salvar/i }))

    expect(aoSalvar).toHaveBeenCalledWith({
      title: 'Mercado do mês',
      amount: 123.5,
      category: 'Alimentação',
      type: 'despesa',
    })
  })

  it('manda o tipo receita quando o usuário troca o botão', async () => {
    const { aoSalvar } = montar()

    await usuario.click(screen.getByRole('button', { name: 'Receita' }))
    await usuario.type(screen.getByLabelText('Valor'), '500000')
    await usuario.type(screen.getByLabelText('Título'), 'Salário')
    await usuario.type(screen.getByLabelText('Categoria'), 'Trabalho')

    await usuario.click(screen.getByRole('button', { name: /salvar/i }))

    expect(aoSalvar).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'receita', amount: 5000 }),
    )
  })

  it('mostra no campo certo o erro que a API devolveu', async () => {
    const aoSalvar = vi.fn().mockRejectedValue(
      new ErroDaApi('Confira os campos informados.', 400, [
        { campo: 'title', mensagem: 'O título pode ter no máximo 60 caracteres.' },
      ]),
    )

    montar(aoSalvar)

    await usuario.type(screen.getByLabelText('Valor'), '1000')
    await usuario.type(screen.getByLabelText('Título'), 'Um título qualquer')
    await usuario.type(screen.getByLabelText('Categoria'), 'Outros')

    await usuario.click(screen.getByRole('button', { name: /salvar/i }))

    expect(
      await screen.findByText('O título pode ter no máximo 60 caracteres.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Confira os campos informados.')).toBeInTheDocument()
  })

  it('usa as categorias que já existem como atalho', async () => {
    montar()

    await usuario.click(screen.getByRole('button', { name: 'Mercado' }))

    expect(screen.getByLabelText('Categoria')).toHaveValue('Mercado')
  })
})
