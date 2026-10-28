# REASONS — REQ-042 — Quem decide a parceria (Triagem 1 → Triagem 2)
**Status:** RASCUNHO
**Requisito:** `requirements/REQ-042-decisor-da-parceria.md`
**Análise:** `spdd/analysis/REQ-042-decisor-da-parceria.md`

## R · Requirements
Pergunta "Quem decide a parceria?" com campos condicionais obrigatórios (nome completo, e-mail, telefone/WhatsApp do decisor) e Triagem 2 exibindo os dados consolidados da Triagem 1 sem redigitar.

## E · Entities
Ver delta da análise.

## A · Approach
Banco: 3 colunas, grant de update, gatilho, `enviar_ficha`, `requisitos_triagem2`. Regras: `decisor.ts`. Telas: `Formulario.tsx`, `NovaEmpresa.tsx`, `AbaResumo.tsx`, `AbaTriagem1.tsx`, `AbaClassificacao.tsx`, `ResumoTriagem1.tsx`.

## S · Structure
`src/regras/decisor.ts`(+test) · `src/regras/formulario.ts` · `src/dados/{campos,tipos,api}.ts` · telas citadas · migration 20261026040000

## O · Operations
- **OP-4201 Banco.** Migration `20261026040000`.
- **OP-4202 Regras.** `decisor.ts` + testes; `formulario.ts`.
- **OP-4203 Telas.** Formulário, Nova empresa, Resumo, Triagem 1, painel na Triagem 2.

## N · Norms
- N-4201 Validação igual na tela e no banco.

## S · Safeguards
- S-4201 Empresa antiga não é bloqueada em outras etapas.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1–4 | OP-4201, OP-4202, OP-4203 | teste de regra + navegador |
