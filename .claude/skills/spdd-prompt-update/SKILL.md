---
name: spdd-prompt-update
description: Atualiza o mesmo REASONS quando muda regra, comportamento, tela, permissão, contrato de dado ou critério de aceite. Não implementa código.
disable-model-invocation: true
argument-hint: "[@spdd/prompt/<canvas>.md] [mudança]"
---

<!-- Fonte: legalizai-projeto/spdd-compartilhado — não edite esta cópia; edite a fonte e rode sincronizar.sh -->

# SPDD Prompt Update

## Antes de tudo

Leia `.claude/spdd-perfil.md` deste repo (status, fonte das decisões, onde registrar contradição). **O perfil ganha deste arquivo em qualquer conflito.**

## Passos

1. **Entrada.** Sem o arquivo ou sem a mudança, pergunte e pare.
2. **Leia o canvas inteiro** e o código afetado, se a mudança tocar algo existente.
3. **Mapeie o impacto:**

   | Mudança | Seções afetadas |
   |---|---|
   | requisito funcional novo | R, E, A, S, O, talvez N e Safeguards |
   | arquitetura | A, S, O, N |
   | entidade ou tipo novo | E, S, O |
   | restrição nova | Safeguards, talvez O |
   | padrão de código | N, O |
   | erro na especificação | só a seção |

4. **Aplique só o necessário:** não reescreva seção que não muda e propague a consequência entre as sete seções e a matriz.
5. **Confira a consistência** (Entities × Operations × Structure × Safeguards).
6. **Mesmo arquivo:** sem v2/v3, sem renomear; o Git guarda o histórico. Volte o status conforme o perfil.
7. **Se a mudança vem de decisão,** cite a fonte. Se contradiz uma decisão anterior, registre onde o perfil manda.
8. **Relate** as seções mudadas, as intocadas e o próximo comando (`/spdd-generate @<canvas>`).

## Nunca

- Implementar código nesta skill.
- Bloco de código de linguagem no canvas.
