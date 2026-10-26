# Análise — REQ-036 — Telas de trabalho no novo padrão
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-036-telas-de-trabalho-no-novo-padrao.md`

## Resumo
Varredura final: as regras próprias das telas (funil, ficha, calendário, Início, listas) passam a usar só tokens e o vocabulário do site; gráficos na paleta do Manual.

## Estado atual
- `src/telas/**`: nenhuma cor, raio ou sombra solta em estilo inline; só `var(--…)` [m].
- `src/estilo.css`, fora do `:root`: 16 hexadecimais em regras de tela (cabeçalhos de coluna do funil, painéis tingidos `#EFE6D4` da ficha, reservas do calendário, ícones de prazo, estados do cartão de empresa) e 3 nas peças (texto de alerta/perigo); raios soltos (6–14 px, 999 px) e sombras em `rgba(20,37,64,…)` do Oceano antigo [m].
- Seções duplicadas: "Funil" original + REQ-021 + "Área de trabalho" + REQ-029 redefinem `.coluna`/`.cartao-empresa`; "Ficha" REQ-022 + REQ-030 redefinem abas e painéis [m].
- Conflito de nome: `.legenda` é rótulo de fieldset (ficha) e lista de legenda do gráfico; o bloco REQ-034 (`display: block`) quebra a legenda do gráfico [m].
- Gráficos (`Graficos.tsx`, `regras/graficos.ts`) em tons do Oceano antigo `#142540…#86A0C8`; teste espera `#142540` [m].
- `.card` sem uso [m].

## Estado desejado
Bloco único "REQ-036: telas" no lugar das seções de tela antigas; zero hexadecimal fora do `:root`; raios só `var(--radius)` (círculos com 50 %); sombras só `var(--sombra)`; colunas do funil tingidas por grupo com Areia, Céu, Sálvia e erro; ficha com blocos em Areia clara e linha fina; calendário com hoje em traço dourado e reservas retas; gráficos do Oceano ao Céu.

## Delta
- `src/estilo.css`: tokens `--warn-texto`, `--danger-texto`; remove seções "Funil", "Linha do tempo", "Telas sem casca", "Ficha da empresa", "Calendário (REQ-012)", REQ-020, REQ-021, REQ-022, REQ-023, "Área de trabalho", "Estados sem faixa lateral", REQ-029, REQ-030; bloco REQ-036; `.legenda` separada em `legend.legenda` e `ul.legenda`.
- `src/regras/graficos.ts` (+ teste) e `src/componentes/graficos/Graficos.tsx`: paleta.
- Sem mudança de comportamento, permissão ou texto.

## Riscos
- Densidade: colunas do funil de 300 px e cartões de 14 px de respiro mantidos [m]; critério 2 verificado em 1440 px.
- Regras removidas sem equivalente [d]: conferir Funil, Ficha (todas as abas), Calendário (semana e mês), Início e listas no navegador.

## Cobertura dos critérios
| Critério | Atendível |
|---|---|
| 1 busca por valores soltos | Sim (grep em `src/telas/**` e fora do `:root`) |
| 2 densidade do funil | Sim |
| 3 percorrer telas com Gerente e Jurídico | Sim |
| 4 lint, test, build | Sim |

## Direção recomendada
Reescrever as seções de tela num bloco só, como nos REQ-032/033.

## Decisões pendentes
DP-3601 na recomendação: um REQ com uma operação por área.

## Prontidão para REASONS
Pronto.
