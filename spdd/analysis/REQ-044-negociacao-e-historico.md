# Análise — REQ-044 — Negociação (abas) e Histórico de encerradas
**Status:** RASCUNHO
**Requisito:** `requirements/REQ-044-negociacao-e-historico.md`

## Resumo
Telas "Propostas em Análise", "Propostas em Negociação" e "Reuniões Agendadas"; leads Encerrados/Perdidos saem das colunas ativas e vão para "Histórico / Encerradas" com o motivo.

## Estado atual
Propostas e reuniões só apareciam por etapa no quadro; "Encerrada" e "Recusada" competiam com leads ativos. [m]

## Estado desejado
Telas "Propostas em Análise", "Propostas em Negociação" e "Reuniões Agendadas"; leads Encerrados/Perdidos saem das colunas ativas e vão para "Histórico / Encerradas" com o motivo.

## Delta
Banco: gatilho `motivo_encerramento` + retroativo. Regras: `etapas.ts`, `negociacao.ts`. Telas: `Negociacao.tsx`, `Historico.tsx`, `TelaEmpresas.tsx`, `Casca.tsx`, `App.tsx`.

## Riscos
Dado existente: ver "Decisões pendentes". Sem mudança de permissão fora da citada. [i]

## Cobertura dos critérios
| Critério | Atendível |
|---|---|
| 1–4 | Sim |

## Direção recomendada
Seguir as recomendações das decisões pendentes.

## Decisões pendentes
- `DP-4401` Como dividir Análise e Negociação? → Análise = ainda não enviada (ou com a Direção); Negociação = enviada sem aceite
- `DP-4402` Em espera vai ao Histórico? → Não: é pausa, não fechamento
- `DP-4403` Manter /empresas/recusadas? → Sim, convive com o Histórico

## Prontidão para REASONS
Pronto após aprovação das decisões pendentes.
