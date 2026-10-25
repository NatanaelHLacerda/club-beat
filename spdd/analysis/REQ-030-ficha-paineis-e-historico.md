# Análise — REQ-030 — Ficha da empresa: painéis e histórico no padrão do kit
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-030-ficha-paineis-e-historico.md`

## Resumo
Mantém as duas colunas; perfil ganha painel chave–valor; grupos e abas entram num cartão com seletor segmentado; blocos das abas viram painéis tingidos (sem cartão dentro de cartão); Linha do tempo com avatar e campo fixo.

## Estado atual
- `Ficha.tsx`: perfil, grupos e abas soltos sobre o fundo; trilho com Próximo passo, Situação, Mensagens, Mudar etapa [m].
- `PerfilEmpresa.tsx`: `dl` com ícones em duas colunas [m].
- `AbaTempo.tsx`: formulário de nota em cima; lista com data à esquerda [m].

## Estado desejado
Conforme regras 1–5 do requisito.

## Delta
`PerfilEmpresa.tsx`, `Ficha.tsx` (`.conteudo-abas`), `AbaTempo.tsx`, CSS “REQ-030”.

## Riscos
Abas com formulários longos herdam o painel tingido; conferido em Reunião e proposta [i].

## Cobertura dos critérios
| Critério | Atendível | Lacuna |
|---|---|---|
| 1–3 | Sim | — |

## Direção recomendada
Mudança só de marcação e estilo; regras e consultas iguais.

## Decisões pendentes
DP-3001 na recomendação (trilho só ganha a escala).

## Prontidão para REASONS
Pronto.
