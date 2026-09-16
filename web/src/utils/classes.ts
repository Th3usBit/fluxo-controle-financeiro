type Classe = string | false | null | undefined

/** Junta classes CSS ignorando o que for falso. Evita uma dependência só para isso. */
export function classes(...lista: Classe[]): string {
  return lista.filter(Boolean).join(' ')
}
