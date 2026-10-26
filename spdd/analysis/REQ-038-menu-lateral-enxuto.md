# Análise — REQ-038 — Menu lateral enxuto
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-038-menu-lateral-enxuto.md`

## Resumo
Tirar do menu lateral o grupo Configuração e o item Avisos, que agora estão no menu da pessoa (REQ-037) e no sino.

## Estado atual
- `src/componentes/Casca.tsx`: `grupos` com Funil (5 itens + 2 subitens), Parcerias (5), Acompanhamento (Painel, Prazos, Avisos) e Configuração (4) [m].
- Rotas `/avisos` e `/config/*` declaradas em `App.tsx`, independentes do menu [m].
- Menu com 26 px entre grupos e itens de 9 px de respiro; em 768 px de altura a Gerente precisa rolar [i].

## Estado desejado
Três grupos (Funil, Parcerias com Renovações antes de Operações e Jurídico, Acompanhamento com Painel e Prazos); sem rolagem em 1366 × 768 para a Gerente.

## Delta
`Casca.tsx` (lista de grupos). Estilo: espaçamento entre grupos ajustado se preciso. Rotas intactas.

## Riscos
Nenhum de permissão: só some item do menu [m].

## Cobertura dos critérios
| Critério | Atendível |
|---|---|
| 1–4 | Sim |

## Direção recomendada
Editar a lista; medir a altura do menu no navegador.

## Decisões pendentes
DP-3801 e DP-3802 na recomendação.

## Prontidão para REASONS
Pronto.
