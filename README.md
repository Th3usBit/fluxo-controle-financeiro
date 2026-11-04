<div align="center">

# Fluxo

**Veja para onde vai o seu dinheiro.**

Registre receitas e despesas em segundos, acompanhe o saldo e descubra em quais categorias o mês está pesando.

[**Abrir o Fluxo →**](https://th3usbit.github.io/fluxo-controle-financeiro/)

Grátis · sem cadastro · funciona no computador e no celular

</div>

<br>

![Tela principal do Fluxo](.github/assets/tela-clara.png)

---

## O que dá para fazer

**Saber quanto sobrou, de relance.** Receitas, despesas e saldo ficam no topo da tela, junto com a fatia de cada um no que entrou e saiu.

**Lançar um gasto em dez segundos.** Escolha se é receita ou despesa, digite o valor e o título e salve. As categorias que você já usou aparecem como sugestão, então não precisa digitar tudo de novo.

**Descobrir onde o dinheiro está indo.** O painel *Para onde vai o dinheiro* ordena as categorias da maior para a menor despesa, com o percentual de cada uma. Os *Destaques* mostram qual foi a maior despesa e a maior receita.

**Encontrar qualquer lançamento.** Busque pelo título e filtre por receitas, despesas ou categoria. Os totais do topo acompanham o filtro, então é fácil saber, por exemplo, quanto foi só em alimentação.

**Usar como preferir.** Tem tema claro e tema escuro, e o layout se ajusta ao celular.

<table>
  <tr>
    <td width="50%"><img src=".github/assets/formulario.png" alt="Cadastro de uma nova despesa"></td>
    <td width="50%"><img src=".github/assets/tela-escura.png" alt="Fluxo no tema escuro"></td>
  </tr>
  <tr>
    <td align="center">Nova transação</td>
    <td align="center">Tema escuro</td>
  </tr>
</table>

---

## Seus dados ficam com você

Não tem conta nem login, e nada vai para um servidor: os lançamentos ficam salvos **no próprio navegador**. Isso tem duas consequências:

- Ninguém além de você vê os seus números.
- Os dados ficam só naquele navegador e naquele aparelho. Se você limpar os dados do site ou abrir em outro aparelho, a lista começa do zero.

Na primeira visita, o Fluxo abre com alguns lançamentos de exemplo para você explorar. Pode apagar todos e começar do seu jeito.

---

## Para quem quer rodar no próprio computador

O Fluxo também tem uma versão completa, com servidor e banco de dados próprios. Você precisa do [Node.js](https://nodejs.org) 18 ou mais recente.

```bash
npm run instalar   # instala tudo
npm run dev:api    # em um terminal: o servidor
npm run dev:web    # em outro: a interface, em http://localhost:3000
```

Feito com Next.js, React, Express, SQLite e TypeScript.
