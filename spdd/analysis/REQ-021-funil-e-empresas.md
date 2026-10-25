# Análise — REQ-021 — Funil e Empresas no novo visual
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-021-funil-e-empresas.md`

## Resumo

Funil e Empresas viram uma tela com dois modos (Quadro e Lista), cartões com avatar, padrão, responsável e prazo, lista com a tabela do REQ-018 e ação "Mover etapa" num painel lateral. As regras do REQ-004 não mudam.

## Estado atual

- `src/telas/funil/Funil.tsx`: quadro com arrastar, `TrocaEtapa` ao soltar em saída, destaque de pedido e de resposta vencidos, pill de prazo (REQ-014) [m].
- `src/telas/empresas/Empresas.tsx`: tabela própria com busca da URL (REQ-019) [m].
- `Filtros` compartilhado [m]; `Tabela`, `Avatar`, `Pill` prontos [m].

## Estado desejado

`/funil` abre no modo lembrado; `/empresas` abre em Lista; filtros com "Limpar filtros" e contagem; saídas recolhidas.

## Conceitos e domínio

- Prazo da etapa vem de `prazos_abertos` [m].
- Escolha do modo é conveniência por pessoa (`localStorage`) [d].

## Delta

Tela única `TelaEmpresas` (quadro/lista), `CartaoEmpresa`, `PainelLateral` (componente de UI), `Filtros` com limpar; rotas `/funil` e `/empresas` apontando para a mesma tela.

## Riscos

- Arrastar e clicar no mesmo cartão: o cartão continua sendo link; o arrastar usa os eventos de hoje [m].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Cartão completo | Sim | — |
| 2 Lista lembrada | Sim | — |
| 3 Limpar filtros | Sim | — |
| 4 Ativa bloqueada | Sim | — |
| 5 375 px | Sim | — |

## Direção recomendada

Uma tela, dois modos, mesmas consultas.

## Decisões pendentes

DP-2101 pela recomendação.

## Prontidão para REASONS

Pronto.
