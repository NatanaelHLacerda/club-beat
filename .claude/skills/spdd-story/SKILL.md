---
name: spdd-story
description: Decompõe uma necessidade de negócio (semente) em requisitos/stories INVEST com escopo e critérios de aceite testáveis, sem olhar código.
disable-model-invocation: true
argument-hint: "[texto ou @arquivo da semente]"
---

<!-- Fonte: legalizai-projeto/spdd-compartilhado — não edite esta cópia; edite a fonte e rode sincronizar.sh -->

# SPDD Story

Fase do **o quê** e **para quem**. Análise técnica é do `/spdd-analysis`.

## Antes de tudo

Leia `.claude/spdd-perfil.md` deste repo. Ele define onde a story mora, o nome do arquivo, o template e o índice. **O perfil ganha deste arquivo em qualquer conflito.**

## Passos

1. **Entrada.** Sem texto nem `@arquivo`, pergunte e pare. Leia inteiro todo arquivo citado (pasta citada: todos os arquivos relevantes). Não resuma a fonte; preserve o original.
2. **Não duplicar.** Liste o diretório de requisitos do perfil e o índice. Veja o que já está coberto e qual é o próximo número. **Não explore o código.**
3. **INVEST.** Escreva a tarefa abstrata (responsabilidade, operações, restrições, complexidade) e avalie Independente · Negociável · Valiosa · Estimável · Pequena · Testável. Se precisar dividir, divida por operação, complexidade, papel ou dependência — **nunca por camada técnica**. No máximo 3 pontos funcionais e 1 a 5 dias por story.
4. **Escreva cada story** no template do perfil. Toda story tem: contexto, valor, dependências e premissas, escopo dentro/fora e critérios de aceite.
5. **Critérios de aceite** em Dado/Quando/Então, em linguagem de negócio, com **valores concretos**. Cubra caminho feliz, regra/validação, erro e (se o perfil pedir) permissão. Cada critério tem que ser verificável por alguém que não leu o código. Nada de *como* implementar.
6. **Salve** no caminho do perfil e acrescente a linha no índice.
7. **Relate** as stories geradas, o esforço estimado e o próximo comando (`/spdd-analysis @<arquivo>`).

## Nunca

- Inventar decisão de produto: o que a fonte não responde vira **decisão pendente**.
- Deixar placeholder ou TODO.
- Mexer em código.
