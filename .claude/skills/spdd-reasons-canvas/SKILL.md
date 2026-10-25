---
name: spdd-reasons-canvas
description: Cria o contrato REASONS (Requirements, Entities, Approach, Structure, Operations, Norms, Safeguards) executável a partir do requisito e da análise, sem implementar código.
disable-model-invocation: true
argument-hint: "[@análise ou requisito]"
---

<!-- Fonte: legalizai-projeto/spdd-compartilhado — não edite esta cópia; edite a fonte e rode sincronizar.sh -->

# SPDD REASONS Canvas

Fase do **como**. O canvas é especificação, não código.

## Antes de tudo

Leia `.claude/spdd-perfil.md` deste repo. Ele define o nome do arquivo, o cabeçalho, as regras que todo REASONS herda e se o canvas precisa de aprovação humana antes do `/spdd-generate`. **O perfil ganha deste arquivo em qualquer conflito.**

## Passos

1. **Entrada.** Leia inteiros o requisito, a análise, os REASONS relacionados e o código das telas, dados e rotas envolvidos.
2. **Preencha as sete seções** com conteúdo específico deste caso (nunca só os títulos):
   - **R · Requirements:** o problema e o valor em uma frase, com os limites do recorte.
   - **E · Entities:** tipos e entidades envolvidos e como se relacionam (Mermaid permitido). **Conservador:** se a estrutura existente atende, ela fica. Nada de embrulhar tipo simples sem necessidade funcional.
   - **A · Approach:** estratégia, decisões e por quê; o que se reaproveita do código.
   - **S · Structure:** arquivos que nascem e que mudam (caminho real), dependências e camadas, conforme a arquitetura do `CLAUDE.md`.
   - **O · Operations:** tarefas executáveis **em ordem de dependência**, com id. Cada uma diz: responsabilidade, arquivo, entrada, processamento, saída, estados (carregando / erro / vazio / dado), validações, permissões e **como se verifica**.
   - **N · Norms:** padrões a seguir. **Referencie** as regras do `CLAUDE.md` e do perfil; não as copie.
   - **S · Safeguards:** limites verificáveis: o que nunca pode acontecer, textos exatos de tela/erro, segurança e dado sensível.
3. **Matriz de rastreabilidade:** cada critério de aceite → operation(s) → como se verifica.
4. **Consistência:** toda entidade citada em Operations existe em Entities; todo arquivo de Structure tem operation; todo Safeguard aparece em alguma operation.
5. **Salve** no caminho do perfil com status inicial do perfil e atualize o índice, se houver.
6. **Relate** o resumo por seção e o próximo passo (aprovação humana ou `/spdd-generate @<canvas>`, conforme o perfil).

## Nunca

- Bloco de código de linguagem (dart, ts…) no canvas: descreva assinaturas e lógica em texto. Mermaid é permitido.
- Placeholder ou TODO.
- Escolher decisão pendente: ela fica listada como pendente.
- Implementar código nesta fase.
