---
name: spdd-generate
description: Implementa o código estritamente conforme o REASONS, uma operation por vez, na ordem definida, com verificação.
disable-model-invocation: true
argument-hint: "[@spdd/prompt/<canvas>.md]"
---

<!-- Fonte: legalizai-projeto/spdd-compartilhado — não edite esta cópia; edite a fonte e rode sincronizar.sh -->

# SPDD Generate

## Antes de tudo

Leia `.claude/spdd-perfil.md` deste repo. Ele define se o canvas precisa estar aprovado, os comandos de verificação por operation e no fim, e a política de commit. **O perfil ganha deste arquivo em qualquer conflito.**

## Passos

1. **Entrada.** Sem canvas, pergunte e pare. Confira a aprovação exigida pelo perfil; se faltar, pare e diga de quem é.
2. **Leia tudo:** canvas inteiro, requisito, análise, `CLAUDE.md` e o código vizinho que serve de padrão.
3. **Valide a ordem das operations:** dependências antes de dependentes, nada faltando em relação a Structure. Se achar furo, **pare e proponha `/spdd-prompt-update`**. Não replaneje por conta própria.
4. **Execute uma operation por vez, na ordem:**
   - siga a especificação, os Norms e os Safeguards;
   - use os **textos exatos** dos Safeguards;
   - rode a verificação por operation do perfil.
5. **No fim do canvas,** rode a verificação final do perfil e confira cada critério da matriz de rastreabilidade.
6. **Commit** conforme a política do perfil (canvas e código juntos quando os dois mudaram).
7. **Relate:** arquivos, operations feitas, verificação executada **com a saída real**, critérios atendidos e pendências.

## Quando a realidade diverge

Corrija o **canvas primeiro**: mudança de comportamento usa `/spdd-prompt-update`; refatoração sem mudança usa `/spdd-sync`. Depois o código.

## Nunca

- Ampliar escopo, criar campo, tela ou rota que o canvas não pede.
- Escolher decisão pendente.
- Dar como pronto sem a verificação do perfil passar.
- Push, merge, rebase ou deploy fora do que o perfil autoriza.
