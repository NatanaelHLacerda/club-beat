# REASONS — REQ-029 — Quadro do funil no padrão do kit
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-029-quadro-do-funil.md`
**Análise:** `spdd/analysis/REQ-029-quadro-do-funil.md`

## R · Requirements
Gargalo visível de longe e cartões comparáveis. Fora: mudar o arrastar.

## E · Entities
`GrupoEtapa = entrada | andamento | decisao | fechado | saida`.

## A · Approach
Classe `grupo-*` na coluna; cartão `article` com `dl` de quatro linhas; menu em flutuante.

## S · Structure
- `src/regras/etapas.ts`, `src/regras/etapas.test.ts`
- `src/telas/empresas/CartaoEmpresa.tsx`, `src/telas/empresas/TelaEmpresas.tsx`
- `src/componentes/ui/Icone.tsx`, `src/estilo.css`

## O · Operations
- **OP-2901 Regra.** `grupoDaEtapa` com teste cobrindo todas as etapas.
- **OP-2902 Coluna.** Faixa tingida, contador em pílula, 300 px.
- **OP-2903 Cartão.** Avatar, nome (link), padrão, exemplo; Segmento, Responsável, Na etapa, Prazo.
- **OP-2904 Menu.** Abrir ficha; Mover etapa só com `pode(perfil, 'triar')`.

## N · Norms
- N-2901 Atrasado tingido com borda de 1 px.

## S · Safeguards
- S-2901 Sem botão dentro de link.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-2901, OP-2902 | teste + navegador (cores por grupo) |
| 2 | OP-2903 | navegador |
| 3 | OP-2904 | revisão do código (`aoMover` só com permissão) |
