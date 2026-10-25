# REASONS — REQ-026 — Escala, ritmo e profundidade pelo kit
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-026-escala-e-ritmo.md`
**Análise:** `spdd/analysis/REQ-026-escala-e-ritmo.md`

## R · Requirements
Telas com leitura de 14 px, títulos de cartão de 18 px e da tela de 24 px, respiro do kit. Fora: estrutura das telas.

## E · Entities
Sem entidade.

## A · Approach
Tokens novos (`--sombra-cartao`, `--esp-*`) e bloco “REQ-026” no fim de `estilo.css`.

## S · Structure
- `src/estilo.css`

## O · Operations
- **OP-2601 Tokens.** `--sombra-cartao`, `--radius: 12px`; `--sombra` só em flutuantes.
- **OP-2602 Texto.** `.pequeno` 13 px; rótulos de campo 13 px; h2 de cartão 18 px; h1 da barra 24 px; pills 12 px.
- **OP-2603 Ritmo.** `.cartao` 20 px; `.conteudo` gap 24 px e padding 28/32; `.numeros` gap 20.
- **OP-2604 Botões e campos.** `.botao` 40 px de altura, `.botao.primario` pílula de 44 px; campos 40 px, raio 10.

## N · Norms
- N-2601 Paleta do Club e Sora; sem cor nova.

## S · Safeguards
- S-2601 Nada transborda em 375 px.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-2602 | navegador (estilo calculado) |
| 2 | OP-2601, OP-2603 | navegador |
| 3 | OP-2604 | navegador |
| 4 | todas | detector do impeccable |
