# REASONS — REQ-020 — Painel inicial no estilo do kit
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-020-painel-inicial.md`
**Análise:** `spdd/analysis/REQ-020-painel-inicial.md`

## R · Requirements

Ver em uma tela como está o funil e o que fazer hoje. Fora: indicadores novos.

## E · Entities

- `PontoDia` (`dia`, `quantidade`); `Arco` (`chave`, `valor`, `percentual`, `inicio`, `fim`); `BarraFunil` (`etapa`, `quantidade`, `largura`, `cor`).

## A · Approach

A tela consulta, em paralelo: indicadores do mês e do anterior, empresas, prazos, datas do ano, renovações. Os gráficos recebem dados prontos das funções puras e desenham SVG com `viewBox` responsivo e um resumo em texto escondido para leitores de tela.

## S · Structure

- `src/regras/graficos.ts` + `graficos.test.ts`
- `src/componentes/graficos/GraficoPontos.tsx`, `FunilBarras.tsx`, `Rosca.tsx`
- `src/telas/inicio/Inicio.tsx`
- `src/App.tsx`, `src/componentes/Casca.tsx`, `src/telas/acesso/Entrar.tsx`, `src/estilo.css`

## O · Operations

- **OP-2001 Regras.** `agruparPorDia(datas, mes)`, `linhasDePontos(max)`, `arcosDaRosca(valores)`, `barrasDoFunil(contagens)` (degradê Oceano → Azul 4). Verifica: testes.
- **OP-2002 Gráficos.** Pontos (coluna por dia, maior dia com rótulo), funil (barras horizontais centradas, contagem à direita), rosca (arcos com cor-sinal, total no centro, legenda com 0 nos padrões vazios).
- **OP-2003 Tela.** Cartões (chegaram com variação; ativas, propostas, receita), linha de gráficos, "Para hoje" (até 6, "Ver todos" → Prazos), próximas 5 datas, 3 renovações; link "Indicadores detalhados".
- **OP-2004 Entrada.** `/` e login → `/inicio`; item "Início" no topo do menu.

## N · Norms

- N-2001 Regras do `CLAUDE.md` e do REQ-018 (componentes, paleta).

## S · Safeguards

- S-2001 Dado ausente "—"; receita sem valor "R$ …".
- S-2002 Cada gráfico tem texto alternativo com os números.

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-2003 | navegador |
| 2 | OP-2001, OP-2002 | teste + navegador |
| 3 | OP-2001, OP-2002 | teste + navegador |
| 4 | OP-2003 | navegador |
| 5 | OP-2003 | navegador 375 px |
