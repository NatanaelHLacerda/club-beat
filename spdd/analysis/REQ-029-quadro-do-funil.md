# Análise — REQ-029 — Quadro do funil no padrão do kit
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-029-quadro-do-funil.md`

## Resumo
Faixa da coluna tingida pelo grupo da etapa (regra pura `grupoDaEtapa`), cartão com grade chave–valor e menu "⋯".

## Estado atual
- `TelaEmpresas` quadro: colunas de 240 px com cabeçalho neutro e arrastar [m].
- `CartaoEmpresa`: o cartão inteiro é um link; rodapé em duas linhas [m].

## Estado desejado
Colunas de 300 px; cartão como `article` com link no nome (sem controle aninhado em link) e menu com Abrir ficha / Mover etapa.

## Delta
`regras/etapas.ts` (`grupoDaEtapa` + teste), `CartaoEmpresa.tsx`, `TelaEmpresas.tsx` (`aoMover`), ícone `opcoes`, CSS “REQ-029”.

## Riscos
O cartão deixa de ser clicável por inteiro: o nome e "Abrir ficha" levam à ficha [i].

## Cobertura dos critérios
| Critério | Atendível | Lacuna |
|---|---|---|
| 1–3 | Sim | — |

## Direção recomendada
Cor só na faixa; arrastar mantido.

## Decisões pendentes
DP-2901 na recomendação.

## Prontidão para REASONS
Pronto.
