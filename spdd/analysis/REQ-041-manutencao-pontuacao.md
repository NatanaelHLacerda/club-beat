# Análise — REQ-041 — Manutenção / Configurações: pontuação configurável
**Status:** RASCUNHO
**Requisito:** `requirements/REQ-041-manutencao-pontuacao.md`

## Resumo
Item "Manutenção / Configurações" no menu lateral, com tela para editar cortes de pontos, critérios, pontos de cada opção e faixas de investimento. Nada da pontuação fica fixo.

## Estado atual
Faixas Bronze/Prata/Ouro (5–7, 8–11, 12–15), pontos de cada opção e faixas de investimento estavam fixos no código (`padraoPorPontos`, `padrao_por_pontos`, `concluir_triagem2`). Mudar exige desenvolvedor e migration. [m]

## Estado desejado
Item "Manutenção / Configurações" no menu lateral, com tela para editar cortes de pontos, critérios, pontos de cada opção e faixas de investimento. Nada da pontuação fica fixo.

## Delta
Banco: 3 chaves em `parametros`; funções `salvar_config_pontuacao`, `soma_pontos_ficha`; `padrao_por_pontos` passa a ler `pontuacao_cortes`; `concluir_triagem2` soma pela configuração. Regras: `classificacao.ts`. Telas: `Manutencao.tsx`, `AbaClassificacao.tsx`.

## Riscos
Dado existente: ver "Decisões pendentes". Sem mudança de permissão fora da citada. [i]

## Cobertura dos critérios
| Critério | Atendível |
|---|---|
| 1–5 | Sim |

## Direção recomendada
Seguir as recomendações das decisões pendentes.

## Decisões pendentes
- `DP-4101` Quem edita a pontuação? → Direção e administrador (igual a `parametros`)
- `DP-4102` Item "Manutenção" volta ao menu lateral, que o REQ-038 enxugou? → Sim, só para quem pode editar (Direção/admin)
- `DP-4103` Aplicar a nova régua às classificações já concluídas? → Não: só às novas

## Prontidão para REASONS
Pronto após aprovação das decisões pendentes.
