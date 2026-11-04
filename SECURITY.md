# Política de segurança

## Versões com suporte

Só a versão mais recente da branch `main`, que é a mesma publicada em <https://th3usbit.github.io/fluxo-controle-financeiro/>, recebe correções.

## Como relatar uma vulnerabilidade

**Não abra uma issue pública.** Use o relato privado do GitHub:

1. Abra a aba [Security](https://github.com/Th3usBit/fluxo-controle-financeiro/security) do repositório.
2. Clique em **Report a vulnerability**.
3. Descreva o problema, como reproduzir e qual é o impacto.

O objetivo é responder em até 7 dias. Quando a correção sair, o relato pode ser publicado com crédito para você, se quiser.

## O que entra no escopo

- **Versão publicada:** os dados ficam só no `localStorage` do navegador de cada visitante. Interessa qualquer coisa que exponha esses dados a terceiros ou permita executar código na página (XSS).
- **API local** (`server/`): validação de entrada, injeção de SQL e falhas que derrubem o servidor.

A API não tem autenticação e foi feita para rodar na sua própria máquina. Expô-la na internet sem uma camada de proteção é um uso fora do escopo.
