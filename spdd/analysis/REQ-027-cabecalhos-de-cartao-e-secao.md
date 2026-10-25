# Análise — REQ-027 — Cabeçalho de cartão e barra de ações da tela
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-027-cabecalhos-de-cartao-e-secao.md`

## Resumo
`SecaoCabecalho` vira faixa tingida; `Topo` ganha `secao` para abrir a barra de ações à esquerda; `Filtros` vira botão com flutuante e pills removíveis.

## Estado atual
- `SecaoCabecalho` (`componentes.tsx`): título solto com marcador; usado em 15 lugares [m].
- `Topo` (`Casca.tsx`): ações em `.faixa-acoes` alinhadas à direita [m].
- `Filtros.tsx`: cinco selects e a busca sempre visíveis, numa segunda linha [m]; só Empresas usa [m].

## Estado desejado
Faixa de cabeçalho; uma linha: "• N empresas" | busca, Filtros · N, Quadro/Lista, Nova empresa; pills dos filtros ativos.

## Delta
`Casca.tsx` (prop `secao`), `Filtros.tsx` (botão + `FiltrosAtivos`), `TelaEmpresas.tsx`, ícones `filtros` e `opcoes`, CSS “REQ-027”.

## Riscos
Barra larga em 1200–1400 px: quebra para a linha de baixo [i].

## Cobertura dos critérios
| Critério | Atendível | Lacuna |
|---|---|---|
| 1–4 | Sim | — |

## Direção recomendada
Só CSS para a faixa (componente não muda); barra de ações por prop.

## Decisões pendentes
DP-2701 na recomendação.

## Prontidão para REASONS
Pronto.
