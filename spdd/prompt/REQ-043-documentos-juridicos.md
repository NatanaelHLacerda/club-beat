# REASONS — REQ-043 — Jurídico: Minutas Contratuais e Regras de Classificação
**Status:** RASCUNHO
**Requisito:** `requirements/REQ-043-documentos-juridicos.md`
**Análise:** `spdd/analysis/REQ-043-documentos-juridicos.md`

## R · Requirements
Duas pastas no módulo Jurídico: "Minutas Contratuais" (guardar e baixar modelos) e "Regras de Classificação (Diretrizes)" (documentos + régua de pontos em vigor).

## E · Entities
Ver delta da análise.

## A · Approach
Banco: tabela, bucket, políticas. Dados: 4 funções em `api.ts`. Telas: `PastaDocumentos.tsx`, `Juridico.tsx`.

## S · Structure
`src/telas/juridico/{Juridico,PastaDocumentos}.tsx` · `src/dados/{api,tipos}.ts` · `src/lib/permissoes.ts` · migration 20261026050000

## O · Operations
- **OP-4301 Banco.** Migration `20261026050000`.
- **OP-4302 Dados.** Listar/enviar/baixar/apagar.
- **OP-4303 Telas.** Pastas e abas no Jurídico.

## N · Norms
- N-4301 Tabela nova nasce com RLS e `grant` explícito.

## S · Safeguards
- S-4301 Arquivo órfão é removido se o registro falhar.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1–4 | OP-4301, OP-4302, OP-4303 | teste de regra + navegador |
