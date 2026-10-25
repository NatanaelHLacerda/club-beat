# Análise — REQ-028 — Tabelas no padrão do kit
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-028-tabelas-no-padrao-do-kit.md`

## Resumo
`Tabela` passa a envolver cada célula numa linha com reticências e dica quando cortada; cabeçalho em faixa; Empresas tira a segunda e a terceira linha das células.

## Estado atual
- `Tabela` (`componentes.tsx`) usada por 9 telas; células quebram livremente [m].
- Empresas: Marca com "chegou em" e "EXEMPLO" em linhas extras; Prazo com descrição e data embaixo [m].
- Operações: coluna Contrapartidas é uma lista longa [m].

## Estado desejado
Linhas de 48 px; `quebra` para colunas de lista; `largo` para colunas que somem quando falta espaço.

## Delta
`ColunaTabela.quebra/largo`, `.celula` com dica, `Exemplo` como pill, coluna "Chegada", container query.

## Riscos
Texto cortado esconde informação: mitigado pela dica e pela ficha [i].

## Cobertura dos critérios
| Critério | Atendível | Lacuna |
|---|---|---|
| 1–4 | Sim | — |

## Direção recomendada
Mudar no componente; nas telas, só Empresas e Operações.

## Decisões pendentes
DP-2801 na recomendação.

## Prontidão para REASONS
Pronto.
