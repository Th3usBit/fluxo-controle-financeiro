import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--fonte-padrao',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Fluxo · Controle financeiro pessoal',
  description:
    'Registre receitas e despesas, acompanhe o saldo e veja para onde vai o seu dinheiro.',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f6f9' },
    { media: '(prefers-color-scheme: dark)', color: '#080b12' },
  ],
}

/**
 * Aplica o tema antes da primeira pintura: sem isso, quem usa o modo escuro vê
 * um flash branco a cada carregamento.
 */
const SCRIPT_DO_TEMA = `
(function () {
  try {
    var salvo = localStorage.getItem('fluxo:tema');
    var preferido = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
    document.documentElement.dataset.tema = salvo === 'claro' || salvo === 'escuro' ? salvo : preferido;
  } catch (erro) {
    document.documentElement.dataset.tema = 'claro';
  }
})();
`

export default function LayoutRaiz({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_DO_TEMA }} />
      </head>
      <body className={inter.variable}>{children}</body>
    </html>
  )
}
