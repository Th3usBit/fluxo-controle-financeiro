<div align="center">

<a href="https://th3usbit.github.io/fluxo-controle-financeiro/"><img src=".github/assets/capa.jpg" width="100%" alt="Fluxo: saiba para onde vai o seu dinheiro. Telas reais do app nos temas claro e escuro."></a>

Controle financeiro pessoal no navegador. Você registra receitas e despesas, e o Fluxo mostra o saldo e para onde o dinheiro está indo. Sem cadastro e sem instalar nada.

<a href="https://th3usbit.github.io/fluxo-controle-financeiro/"><img src=".github/assets/botao.svg" height="52" alt="Abrir o Fluxo"></a>

[Rodar na sua máquina](#rodar-na-sua-máquina) · [API](#api) · [Contribuir](CONTRIBUTING.md)

</div>

## O que ele faz

- Mostra receitas, despesas e saldo. Os totais acompanham os filtros aplicados.
- Busca pelo título e filtra por tipo e categoria, sem diferenciar acentos nem maiúsculas.
- Mostra o percentual de cada categoria no total.
- Tem tema claro e escuro.

![O Fluxo em uso: um lançamento entra e os totais e a lista se atualizam](.github/assets/fluxo-em-acao.gif)

## Onde ficam os dados

Na versão publicada, tudo fica no `localStorage` do seu navegador. Não há conta nem sincronização: cada aparelho tem a própria lista, e limpar os dados do navegador apaga os lançamentos.

Rodando na sua máquina, os dados ficam em um arquivo SQLite, por padrão `server/data/fluxo.db`.

## Rodar na sua máquina

Você precisa do Node.js 22 e do npm.

```bash
git clone https://github.com/Th3usBit/fluxo-controle-financeiro.git
cd fluxo-controle-financeiro
npm run instalar
```

Depois, suba cada parte em um terminal:

```bash
npm run dev:api   # API em http://localhost:3333
npm run dev:web   # interface em http://localhost:3000
```

Na primeira execução, a API cria o banco e cadastra transações de exemplo.

A API lê estas variáveis do ambiente do processo. O arquivo `.env` não é carregado automaticamente.

| Variável | Padrão | Para que serve |
|---|---|---|
| `PORT` | `3333` | Porta da API |
| `CORS_ORIGIN` | `http://localhost:3000` | Origens liberadas, separadas por vírgula |
| `STORAGE` | `sqlite` | `sqlite` ou `memoria` |
| `DATABASE_FILE` | `data/fluxo.db` | Arquivo do banco, relativo à pasta `server/` |
| `SEED` | ligado | `false` não cadastra os exemplos |

## API

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/transactions` | Lista as transações. Aceita `type` (`receita`, `despesa` ou `todas`), `category` e `search` |
| `POST` | `/transactions` | Cria uma transação com `title`, `amount`, `category` e `type` (opcional) |
| `DELETE` | `/transactions/:id` | Remove uma transação |
| `GET` | `/summary` | Devolve receitas, despesas e saldo, com os mesmos filtros da listagem |
| `GET` | `/categories` | Lista as categorias em uso |
| `GET` | `/health` | Informa se a API está no ar |

## Estrutura

```
server/   API em Express 5 e TypeScript, com SQLite e validação em Zod
web/      interface em Next.js e React, com CSS Modules
```

A versão publicada no GitHub Pages usa a mesma interface, sem servidor: `web/src/services/api-local.ts` reproduz as regras da API dentro do navegador.

## Testes

```bash
npm test
npm run typecheck
```

## Contribuir

Veja o [guia de contribuição](CONTRIBUTING.md). Falhas de segurança seguem a [política de segurança](SECURITY.md).

## Licença

[MIT](LICENSE)
