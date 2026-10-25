# REASONS — REQ-027 — Cabeçalho de cartão e barra de ações da tela
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-027-cabecalhos-de-cartao-e-secao.md`
**Análise:** `spdd/analysis/REQ-027-cabecalhos-de-cartao-e-secao.md`

## R · Requirements
Cabeçalho de cartão em faixa e barra de ações numa linha, com filtros recolhidos. Fora: regras de filtragem.

## E · Entities
`FiltrosEmpresas` (sem mudança).

## A · Approach
Faixa por CSS; `Topo({ secao })`; `Filtros` com estado aberto, fecha com Esc ou clique fora; `FiltrosAtivos` remove um filtro por vez.

## S · Structure
- `src/componentes/Casca.tsx`, `src/componentes/Filtros.tsx`, `src/componentes/ui/Icone.tsx`
- `src/telas/empresas/TelaEmpresas.tsx`, `src/estilo.css`

## O · Operations
- **OP-2701 Faixa.** `.secao-cabecalho` com fundo `--surface-2`, raio 10, 48 px, marcador dourado escuro.
- **OP-2702 Topo.** `secao` à esquerda (ponto dourado + texto), ações à direita; quebra abaixo de 1200 px.
- **OP-2703 Filtros.** Botão "Filtros" com contador; flutuante com os cinco campos, "Limpar" e "Pronto".
- **OP-2704 Ativos.** Pills com × e "Limpar filtros" abaixo da barra.
- **OP-2705 Empresas.** Busca sempre visível (quadro e lista); contagem na seção.

## N · Norms
- N-2701 Rótulos visíveis nos campos do flutuante.

## S · Safeguards
- S-2701 A busca por `?busca=` continua funcionando.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-2701 | navegador (Início) |
| 2 | OP-2702, OP-2705 | navegador 1600 px |
| 3 | OP-2703, OP-2704 | navegador (Ouro → "Filtros 1", pill, ×) |
| 4 | OP-2702 | navegador 375 px |
