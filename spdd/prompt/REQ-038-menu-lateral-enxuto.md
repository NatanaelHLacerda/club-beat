# REASONS — REQ-038 — Menu lateral enxuto
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-038-menu-lateral-enxuto.md`
**Análise:** `spdd/analysis/REQ-038-menu-lateral-enxuto.md`

## R · Requirements
Menu lateral só com o trabalho do dia a dia. Fora: mudança de rota.

## E · Entities
Sem entidade.

## A · Approach
Editar `grupos` em `Casca.tsx`; ajustar o espaçamento do menu só se a medida em 1366 × 768 pedir.

## S · Structure
- `src/componentes/Casca.tsx`
- `src/estilo.css` (se preciso)

## O · Operations
- **OP-3801 Grupos.** Remover o grupo Configuração e o item Avisos; Parcerias na ordem Parcerias ativas, Calendário, Renovações, Operações, Jurídico.
- **OP-3802 Altura.** Medir o menu da Gerente em 1366 × 768; se rolar, reduzir o espaço entre grupos e o respiro dos itens.

## N · Norms
- N-3801 Permissão continua só por `pode()`.

## S · Safeguards
- S-3801 `/avisos` e `/config/*` continuam abrindo por link.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-3801 | navegador |
| 2 | OP-3802 | navegador 1366 × 768 (`scrollHeight` do menu) |
| 3 | S-3801 | navegador em `/config/usuarios` |
| 4 | OP-3801 | navegador 375 px |
