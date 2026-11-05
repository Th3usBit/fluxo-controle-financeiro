<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/readme/banner-escuro.svg">
  <img alt="Fluxo: seu dinheiro, com toda a clareza. Grátis, sem cadastro e direto no navegador." src=".github/readme/banner-claro.svg" width="100%">
</picture>

<br><br>

<a href="https://th3usbit.github.io/fluxo-controle-financeiro/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/readme/botao-abrir-escuro.svg">
    <img alt="Abrir o Fluxo" src=".github/readme/botao-abrir-claro.svg" width="340">
  </picture>
</a>

<br>

[![CI](https://github.com/Th3usBit/fluxo-controle-financeiro/actions/workflows/ci.yml/badge.svg)](https://github.com/Th3usBit/fluxo-controle-financeiro/actions/workflows/ci.yml)
[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-4f46e5.svg)](LICENSE)

</div>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/readme/divisor-escuro.svg">
  <img alt="" src=".github/readme/divisor-claro.svg" width="100%">
</picture>

## Comece agora, do jeito certo

Abra o Fluxo e ele já está pronto para você. **Sem cadastro, sem configuração, sem planilha.** A primeira tela é um convite: tudo pronto para começar. Cada receita e cada despesa que você anotar dali em diante vira clareza sobre o seu dinheiro.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/readme/vitrine-escuro.svg">
  <img alt="A tela do Fluxo aberta pela primeira vez, com a mensagem: tudo pronto para começar" src=".github/readme/vitrine-claro.svg" width="100%">
</picture>

## Feito para você enxergar longe

Tudo o que importa no seu dia a dia financeiro, numa tela só, com movimento que mostra cada mudança acontecendo.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/readme/recursos-escuro.svg">
  <img alt="Saldo sempre à vista. Lançou, pronto. Cada entrada celebrada. Seus hábitos em ordem. Tudo num instante. De dia e de noite." src=".github/readme/recursos-claro.svg" width="100%">
</picture>

## Privacidade que traz tranquilidade

Suas finanças são suas. O Fluxo guarda cada lançamento **no seu próprio navegador**, sem conta e sem servidor no meio do caminho. Para manter o histórico completo, use sempre o mesmo aparelho e o mesmo navegador.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/readme/privacidade-escuro.svg">
  <img alt="Seus dados ficam no seu navegador. Sem conta, sem login, sem e-mail. Sem anúncios e sem rastreadores. Código aberto para qualquer pessoa conferir." src=".github/readme/privacidade-claro.svg" width="100%">
</picture>

## Qualidade que você pode conferir

Cada número abaixo é real e verificável. Os testes rodam automaticamente a cada mudança no código, e as animações foram conferidas no **Edge, no Chrome e no Firefox**.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/readme/numeros-escuro.svg">
  <img alt="37 testes automatizados, 3 navegadores verificados, 0 contas para criar, 0 dados enviados a servidores" src=".github/readme/numeros-claro.svg" width="100%">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/readme/divisor-escuro.svg">
  <img alt="" src=".github/readme/divisor-claro.svg" width="100%">
</picture>

## Como funciona

No site publicado, o caminho é curto: você anota, o Fluxo organiza e o seu navegador guarda. Na sua máquina, a mesma interface conversa com uma API própria e um banco SQLite.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/readme/como-funciona-escuro.svg">
  <img alt="No site publicado: você, Fluxo e seu navegador. Rodando na sua máquina: interface Next.js, API Express com validação Zod e banco SQLite." src=".github/readme/como-funciona-claro.svg" width="100%">
</picture>

## Rode na sua máquina

Você vai precisar de **Git**, **Node.js 22** (funciona a partir do 18) e **npm**.

```bash
git clone https://github.com/Th3usBit/fluxo-controle-financeiro.git
cd fluxo-controle-financeiro
npm run instalar
```

Depois, abra dois terminais:

```bash
npm run dev:api   # API em http://localhost:3333
```

```bash
npm run dev:web   # interface em http://localhost:3000
```

Prefere a versão que roda só no navegador, igual à publicada?

```bash
cd web
NEXT_PUBLIC_MODO=local npm run dev
```

> No PowerShell: `$env:NEXT_PUBLIC_MODO="local"; npm run dev`

A API funciona sem nenhuma configuração. Para mudar porta, CORS ou o tipo de armazenamento, use o modelo em [`server/.env.example`](server/.env.example).

**Para conferir tudo antes de enviar uma mudança:**

```bash
npm test             # testes da API e da interface
npm run typecheck    # tipos das duas partes
cd web && npm run lint
```

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/readme/stack-escuro.svg">
  <img alt="Feito com TypeScript, Next.js, React, Express, SQLite, Zod, Vitest e GitHub Actions" src=".github/readme/stack-claro.svg" width="100%">
</picture>

## Construa com a gente

O Fluxo cresce com cada ideia. Uma sugestão, uma correção ou uma funcionalidade nova: tudo é muito bem-vindo.

- **Tem uma ideia ou encontrou algo?** [Abra uma issue](https://github.com/Th3usBit/fluxo-controle-financeiro/issues/new/choose).
- **Quer programar?** O [guia de contribuição](CONTRIBUTING.md) mostra o caminho, do ambiente ao pull request.
- **Um espaço acolhedor:** todos seguem o [código de conduta](CODE_OF_CONDUCT.md).
- **Assunto de segurança?** Siga a [política de segurança](SECURITY.md) para relatar em privado.

Curtiu o Fluxo? **Uma ⭐ no repositório ajuda o projeto a chegar a mais pessoas.**

## Licença

Distribuído sob a [licença MIT](LICENSE): use, adapte e compartilhe com liberdade.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/readme/divisor-escuro.svg">
  <img alt="" src=".github/readme/divisor-claro.svg" width="100%">
</picture>

<div align="center">

### Seu próximo passo rumo à clareza financeira leva um clique.

<a href="https://th3usbit.github.io/fluxo-controle-financeiro/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/readme/botao-abrir-escuro.svg">
    <img alt="Abrir o Fluxo" src=".github/readme/botao-abrir-claro.svg" width="340">
  </picture>
</a>

</div>
