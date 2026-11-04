# Contribuindo com o Fluxo

Que bom que você quer ajudar! Correções, melhorias de interface, testes e ajustes de texto são bem-vindos.

## Antes de começar

- **Bug ou ideia?** Abra uma [issue](https://github.com/Th3usBit/fluxo-controle-financeiro/issues/new/choose) usando um dos modelos. Para mudanças grandes, converse na issue antes de escrever código. Assim ninguém perde tempo com algo que não vai entrar.
- **Falha de segurança?** Não abra uma issue pública. Siga a [política de segurança](SECURITY.md).
- Ao participar, você concorda com o [código de conduta](CODE_OF_CONDUCT.md).

## Preparando o ambiente

Você precisa do Node.js 22 (veja `.nvmrc`; o mínimo suportado é o 18) e do npm.

```bash
git clone https://github.com/Th3usBit/fluxo-controle-financeiro.git
cd fluxo-controle-financeiro
npm run instalar
```

Suba as duas partes em terminais separados:

```bash
npm run dev:api   # API em http://localhost:3333
npm run dev:web   # interface em http://localhost:3000
```

Para testar a versão que vai para o GitHub Pages, que guarda os dados no navegador e dispensa a API:

```bash
cd web
NEXT_PUBLIC_MODO=local npm run dev
```

## Como o projeto está organizado

```
server/   API em Express 5 + TypeScript, com SQLite (better-sqlite3) e validação em Zod
web/      interface em Next.js (App Router) + React, com CSS Modules
```

- **Rotas da API:** `GET /transactions`, `POST /transactions`, `DELETE /transactions/:id`, `GET /summary`, `GET /categories` e `GET /health`.
- **Repositórios:** os controllers dependem da interface `RepositorioDeTransacoes`. Ela tem uma implementação em SQLite e outra em memória, usada nos testes.
- **Modo local do front:** `web/src/services/api-local.ts` reimplementa o contrato da API no navegador. **Uma mudança de regra na API precisa ser repetida lá**, senão o site publicado passa a se comportar diferente.

## Convenções

- **Português no código.** Funções, variáveis, mensagens e commits são em português. Só os campos do contrato da API (`title`, `amount`, `category`, `createdAt`) ficam em inglês.
- **TypeScript estrito**, sem `any`.
- **Estilo com CSS Modules e os tokens do `globals.css`.** Nada de framework de UI; cores novas entram como variáveis, com versão para o tema escuro.
- **Dinheiro sempre arredondado em centavos** (veja `arredondar`).
- Formatação: 2 espaços, LF, UTF-8 (o `.editorconfig` cuida disso).

## Antes de abrir o pull request

Rode nas duas pastas, `server` e `web`:

```bash
npm run typecheck
npm test
```

E no `web`, também:

```bash
npm run lint
```

A CI roda exatamente esses comandos em todo pull request.

Checklist:

- [ ] O PR resolve uma coisa só e aponta a issue relacionada (`Closes #12`).
- [ ] Regra nova ou corrigida tem teste.
- [ ] Mudança visual tem captura de tela no PR, nos temas claro e escuro.
- [ ] Se mudou regra da API, o `api-local.ts` acompanha.

## Mensagens de commit

Escreva no imperativo, em português, com um título curto (até ~70 caracteres) e, quando precisar, um corpo explicando **o porquê**:

```
Corrige o saldo quando o filtro de categoria está ativo

O resumo usava a lista sem filtro e os totais não batiam com a tela.
```

## Licença

Ao contribuir, você concorda que o seu código será distribuído sob a [licença MIT](LICENSE) do projeto.
