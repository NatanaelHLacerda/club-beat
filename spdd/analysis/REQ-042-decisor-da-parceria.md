# Análise — REQ-042 — Quem decide a parceria (Triagem 1 → Triagem 2)
**Status:** RASCUNHO
**Requisito:** `requirements/REQ-042-decisor-da-parceria.md`

## Resumo
Pergunta "Quem decide a parceria?" com campos condicionais obrigatórios (nome completo, e-mail, telefone/WhatsApp do decisor) e Triagem 2 exibindo os dados consolidados da Triagem 1 sem redigitar.

## Estado atual
O campo `quem_decide` (eu mesmo / outra pessoa) era opcional e, quando "outra pessoa", não havia onde registrar quem é. A Triagem 2 não mostra os dados da Triagem 1. [m]

## Estado desejado
Pergunta "Quem decide a parceria?" com campos condicionais obrigatórios (nome completo, e-mail, telefone/WhatsApp do decisor) e Triagem 2 exibindo os dados consolidados da Triagem 1 sem redigitar.

## Delta
Banco: 3 colunas, grant de update, gatilho, `enviar_ficha`, `requisitos_triagem2`. Regras: `decisor.ts`. Telas: `Formulario.tsx`, `NovaEmpresa.tsx`, `AbaResumo.tsx`, `AbaTriagem1.tsx`, `AbaClassificacao.tsx`, `ResumoTriagem1.tsx`.

## Riscos
Dado existente: ver "Decisões pendentes". Sem mudança de permissão fora da citada. [i]

## Cobertura dos critérios
| Critério | Atendível |
|---|---|
| 1–4 | Sim |

## Direção recomendada
Seguir as recomendações das decisões pendentes.

## Decisões pendentes
- `DP-4201` Empresas antigas com "outra pessoa" e sem dados ficam bloqueadas até preencher? → Sim, só na passagem para a Triagem 2
- `DP-4202` "Quem decide" é obrigatório na entrada manual? → Não: a entrada manual segue mínima; só exige os dados quando marcar "outra pessoa"

## Prontidão para REASONS
Pronto após aprovação das decisões pendentes.
