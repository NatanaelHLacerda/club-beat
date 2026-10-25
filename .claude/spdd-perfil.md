# Perfil SPDD — CRM de Parcerias Club Beat (React + Supabase)

As skills `spdd-*` vêm de `legalizai-projeto/spdd-compartilhado`. Este arquivo diz como elas se aplicam aqui e ganha delas em conflito.

## Leitura obrigatória antes de qualquer fase

`CLAUDE.md` · `spdd/README.md` · a semente · o documento-base (`~/Downloads/analise-fernanda.pdf`) quando a semente cita capítulo.

## Convenção de arquivos

```text
requirements/REQ-XXX-slug.md
spdd/analysis/REQ-XXX-slug.md
spdd/prompt/REQ-XXX-slug.md
```

Índice das sementes: `requirements/README.md`.

## Story

Template de `requirements/README.md`. Critérios em Dado/Quando/Então, verificáveis no navegador ou em teste de regra.

## Análise

Cabeçalho `# Análise — REQ-XXX — Título` · `**Status:**` · `**Requisito:**`. Seções: Resumo · Estado atual · Estado desejado · Conceitos e domínio · Delta (banco, dados, regras, telas) · Riscos · Cobertura dos critérios · Direção recomendada · Decisões pendentes · Prontidão para REASONS. Marcação de confiança [m]/[d]/[i].

## REASONS

Cabeçalho `# REASONS — REQ-XXX — Título` · `**Status:**` · `**Requisito:**` · `**Análise:**`. Ids `OP-XXYY`, `N-XXYY`, `S-XXYY`. Herda as regras do `CLAUDE.md`.

**Aprovação:** `APROVADO` com decisão humana registrada, ou `APROVADO — por delegação` quando a semente tem o gatilho da cadeia.

## Generate

- Por operation: `pnpm typecheck`; migration nova aplicada no banco local (`supabase migration up`).
- No fim do REQ: `pnpm lint`, `pnpm test`, `pnpm build` e os critérios de aceite exercitados no navegador (`pnpm dev`) com o papel que o critério cita.
- Commit local ao fim de cada REQ verificado (canvas, análise e código juntos). Não há remoto: push e deploy pedem autorização.

## Cadeia

Aceita a aprovação da semente como delegação. Paradas próprias, além do portão da skill:
- projeto Supabase hospedado, provedor de e-mail ou WhatsApp, domínio: qualquer coisa que exija conta ou segredo real;
- dependência nova além de React, React Router, Supabase JS e Vitest;
- `supabase db reset` só no banco local.
