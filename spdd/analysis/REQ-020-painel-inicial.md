# Análise — REQ-020 — Painel inicial no estilo do kit
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-020-painel-inicial.md`

## Resumo

Tela `/inicio` que vira a entrada do CRM: quatro cartões de número, chegadas por dia em pontos, funil em barras azuis, rosca por padrão, "Para hoje", próximas datas e renovações. A tabela de indicadores (REQ-016) segue em `/painel`.

## Estado atual

- `indicadores(mes)` devolve chegadas, ativas por padrão, receita (REQ-016) [m].
- `prazos_abertos()` (REQ-014), `listarDatas` (REQ-012), `listarRenovacoes` (REQ-013), `listarEmpresas` (REQ-004) [m].
- `CartaoNumero`, `SecaoCabecalho`, `Pill`, `Avatar` prontos (REQ-018) [m].
- Login leva a `/funil`; "/" redireciona a `/funil` [m].

## Estado desejado

Entrada em `/inicio` com dados reais do mês atual e do anterior.

## Conceitos e domínio

- Variação só onde há o mês anterior: "empresas que chegaram" (indicadores do mês anterior). Parcerias ativas, propostas e receita são retratos de hoje: variação "—" [i].
- Funil em degradê de azul, do mais largo ao mais estreito (guia da marca) [d]; a barra é proporcional à maior etapa [i].
- "Para hoje": prazos atrasados e que vencem hoje, da pessoa ou do papel [d].

## Delta

`src/regras/graficos.ts` (agrupar por dia, escala dos pontos, arcos da rosca, largura do funil) com testes; componentes `GraficoPontos`, `FunilBarras`, `Rosca`; tela `Inicio`; rota e redirecionamentos; item "Início" no menu.

## Riscos

- Gráficos em SVG próprio precisam de resumo em texto (acessibilidade) [d].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 6 vs 4 → +50% | Sim | — |
| 2 Funil em azul com contagens | Sim | — |
| 3 Rosca 100% Ouro | Sim | — |
| 4 Prazo atrasado em "Para hoje" | Sim | — |
| 5 375 px | Sim | — |

## Direção recomendada

Cálculos dos gráficos em função pura; dados por consultas existentes, em paralelo.

## Decisões pendentes

DP-2001 pela recomendação (`/inicio` é a entrada).

## Prontidão para REASONS

Pronto.
