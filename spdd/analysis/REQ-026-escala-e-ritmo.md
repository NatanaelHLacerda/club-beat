# Análise — REQ-026 — Escala, ritmo e profundidade pelo kit
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-026-escala-e-ritmo.md`

## Resumo
Ajuste de tokens: texto base, títulos, espaçamento, sombra de cartão, raio e botão principal em pílula, com valores lidos do kit pelo servidor do Figma (variáveis do frame 08_Main Dashboard).

## Estado atual
- `src/estilo.css`: corpo 14 px, mas `.pequeno` 0,82 rem, rótulos de 0,66–0,78 rem em caixa-alta; `--sombra` 0 12 32 / 16 % usada em cartões e flutuantes; botões de 8×14 px, raio 10 [m].
- Cartões com 18 px de respiro e 22 px entre blocos [m].

## Estado desejado
Escala 13/14/16/18/24; sombra de cartão `0 2px 16px rgba(15,29,51,.08)`; cartões 20 px; 24 px entre blocos; botão principal em pílula de 44 px.

## Delta
Bloco final novo em `estilo.css` (“REQ-026”), sem mexer em componentes.

## Riscos
Texto maior pode quebrar linhas em telas estreitas; verificar 375 px [i].

## Cobertura dos critérios
| Critério | Atendível | Lacuna |
|---|---|---|
| 1–4 | Sim | — |

## Direção recomendada
Sobrescrever no fim do CSS, por token, para manter o histórico legível.

## Decisões pendentes
DP-2601 na recomendação: base 14 px em todas as larguras.

## Prontidão para REASONS
Pronto.
