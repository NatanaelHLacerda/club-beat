# REASONS — REQ-028 — Tabelas no padrão do kit
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-028-tabelas-no-padrao-do-kit.md`
**Análise:** `spdd/analysis/REQ-028-tabelas-no-padrao-do-kit.md`

## R · Requirements
Tabelas escaneáveis, linhas iguais. Fora: colunas e ordenação.

## E · Entities
`ColunaTabela<T>` ganha `quebra?` e `largo?`.

## A · Approach
Célula envolvida em `.celula` (nowrap, max 280 px, reticências, dica no hover se cortada); `.so-largo` some por container query abaixo de 1400 px.

## S · Structure
- `src/componentes/ui/componentes.tsx`, `src/componentes/Rotulos.tsx`
- `src/telas/empresas/TelaEmpresas.tsx`, `src/telas/operacoes/Operacoes.tsx`, `src/estilo.css`

## O · Operations
- **OP-2801 Componente.** `.celula`, `dicaSeCortado`, `classeColuna`.
- **OP-2802 Estilo.** Cabeçalho em faixa arredondada, 14 px/600, caixa normal; td 48 px, meio.
- **OP-2803 Exemplo.** Pill dourado claro; marca sem "(exemplo)" quando a pill aparece.
- **OP-2804 Empresas.** Marca em uma linha; Prazo só pill (dica com etapa e data); coluna Chegada (`largo`).
- **OP-2805 Operações.** Contrapartidas com `quebra`.

## N · Norms
- N-2801 Linha atrasada tingida, sem faixa lateral.

## S · Safeguards
- S-2801 Sem rolagem horizontal da página.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-2801, OP-2802 | navegador (todas as linhas 48 px) |
| 2 | OP-2803 | navegador |
| 3 | OP-2802 | navegador (text-transform none) |
| 4 | OP-2801 | navegador 375 px |
