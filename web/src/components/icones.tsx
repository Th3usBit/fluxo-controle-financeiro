import type { SVGProps } from 'react'

/**
 * Ícones em SVG inline: herdam a cor do texto, escalam com o tamanho passado e
 * não trazem nenhuma biblioteca extra para o pacote.
 */

type PropsDeIcone = SVGProps<SVGSVGElement> & { tamanho?: number }

function Base({ tamanho = 20, children, ...props }: PropsDeIcone) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconeReceita(props: PropsDeIcone) {
  return (
    <Base {...props}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </Base>
  )
}

export function IconeDespesa(props: PropsDeIcone) {
  return (
    <Base {...props}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </Base>
  )
}

export function IconeSaldo(props: PropsDeIcone) {
  return (
    <Base {...props}>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 16.5Z" />
      <path d="M3 8.5V7a2 2 0 0 1 2-2h11" />
      <circle cx="16.5" cy="12.5" r="1.25" />
    </Base>
  )
}

export function IconeMais(props: PropsDeIcone) {
  return (
    <Base {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Base>
  )
}

export function IconeLixeira(props: PropsDeIcone) {
  return (
    <Base {...props}>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </Base>
  )
}

export function IconeBusca(props: PropsDeIcone) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </Base>
  )
}

export function IconeFechar(props: PropsDeIcone) {
  return (
    <Base {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </Base>
  )
}

export function IconeSol(props: PropsDeIcone) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Base>
  )
}

export function IconeLua(props: PropsDeIcone) {
  return (
    <Base {...props}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </Base>
  )
}

export function IconeGrafico(props: PropsDeIcone) {
  return (
    <Base {...props}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-6" />
      <path d="M22 20H2" />
    </Base>
  )
}

export function IconeAlerta(props: PropsDeIcone) {
  return (
    <Base {...props}>
      <path d="M12 3.5 2.8 19a1.2 1.2 0 0 0 1 1.8h16.4a1.2 1.2 0 0 0 1-1.8L12 3.5Z" />
      <path d="M12 9.5v5" />
      <path d="M12 17.8h.01" />
    </Base>
  )
}

export function IconeConfirmado(props: PropsDeIcone) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </Base>
  )
}

export function IconeRecarregar(props: PropsDeIcone) {
  return (
    <Base {...props}>
      <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
      <path d="M21 4v4h-4" />
      <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
      <path d="M3 20v-4h4" />
    </Base>
  )
}

export function IconeCarteiraVazia(props: PropsDeIcone) {
  return (
    <Base {...props}>
      <path d="M3 9.5A2.5 2.5 0 0 1 5.5 7H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 16.5Z" />
      <path d="M3 9.5V8a2 2 0 0 1 2-2h10.5" />
      <path d="M9 13h6" />
    </Base>
  )
}

export function IconeFluxo(props: PropsDeIcone) {
  return (
    <Base strokeWidth={2} {...props}>
      <path d="M4 17c3.5 0 4-10 8-10s4.5 6 8 6" />
      <circle cx="4" cy="17" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="20" cy="13" r="1.6" fill="currentColor" stroke="none" />
    </Base>
  )
}
