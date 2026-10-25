---
name: spdd-analysis
description: Analisa um requisito/story contra o código atual, no nível estratégico (o quê e por quê), sem implementar. Gera a análise em spdd/analysis.
disable-model-invocation: true
argument-hint: "[@requisito ou story]"
---

<!-- Fonte: legalizai-projeto/spdd-compartilhado — não edite esta cópia; edite a fonte e rode sincronizar.sh -->

# SPDD Analysis

Fase do **o quê** e **por quê** no contexto do código. O *como* é do `/spdd-reasons-canvas`.

## Antes de tudo

Leia `.claude/spdd-perfil.md` deste repo. Ele define o nome do arquivo, o template, as fontes extras obrigatórias e onde procurar diagnóstico anterior. **O perfil ganha deste arquivo em qualquer conflito.**

## Passos

1. **Entrada.** Sem requisito, pergunte e pare. Leia inteiro todo arquivo citado e preserve o requisito original sem parafrasear.
2. **Já foi visto?** Procure em `spdd/analysis/`, `spdd/prompt/` e nas pendências indicadas pelo perfil se o assunto já foi diagnosticado. Reaproveite e não refaça a investigação.
3. **Exploração guiada por conceito** (não leia o projeto inteiro):
   - extraia do requisito os substantivos de domínio, as ações, as rotas/telas/endpoints citados;
   - busque arquivos e símbolos com esses nomes e leia os que baterem;
   - siga dependências **um salto** só;
   - se surgir conceito essencial que não estava na lista, faça **mais uma** busca e pare.
4. **Conceitos de domínio.** O que já existe no código (com `arquivo:linha`), o que é novo, como se relacionam e quais regras de negócio estão explícitas e quais estão implícitas.
5. **Direção estratégica.** Abordagem, decisões-chave com trade-off e recomendação, alternativas descartadas e por quê. Sem query, assinatura ou passo a passo.
6. **Riscos e lacunas.** Ambiguidades, casos de borda, riscos técnicos, o que depende de outro repositório (backend) e a **cobertura de cada critério de aceite** (tabela: critério · atendível? · lacuna).
7. **Confiança.** Marque cada afirmação: **[m]** medido (arquivo lido, com linha) · **[d]** documentado · **[i]** inferido. O que não foi verificado se escreve "não verificado".
8. **Salve** no caminho e template do perfil e atualize o índice, se o perfil tiver um.
9. **Relate** um resumo curto e o próximo comando (`/spdd-reasons-canvas @<análise>`).

## Nunca

- Implementar ou alterar código.
- Escolher decisão pendente ou autoaprovar a análise.
- Afirmar sobre o código sem ter lido.
