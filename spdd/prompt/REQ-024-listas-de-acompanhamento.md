# REASONS — REQ-024 — Listas de acompanhamento no novo visual
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-024-listas-de-acompanhamento.md`
**Análise:** `spdd/analysis/REQ-024-listas-de-acompanhamento.md`

## R · Requirements

Listas do dia a dia no mesmo padrão, com o urgente à vista. Fora: regras novas.

## E · Entities

Sem entidade nova.

## A · Approach

Cada tela: `Topo`, `.numeros` com até quatro `CartaoNumero`, `Tabela` com `destaque`. Avisos usa `lista-tarefas`. Operações: tabela + painel lateral com o formulário de confirmação de hoje.

## S · Structure

- `src/componentes/ui/componentes.tsx` (`DataComIcone`)
- `src/dados/api.ts` (`marcarTodosAvisosLidos`)
- `src/telas/parcerias/Parcerias.tsx`, `renovacoes/Renovacoes.tsx`, `prazos/Prazos.tsx`, `fila/MinhaFila.tsx`, `direcao/Direcao.tsx`, `juridico/Juridico.tsx`, `operacoes/Operacoes.tsx`, `avisos/Avisos.tsx`

## O · Operations

- **OP-2401 Peças.** `DataComIcone`; `marcarTodosAvisosLidos` (atualiza só os do usuário, pela RLS).
- **OP-2402 Prazos, Renovações, Direção, Jurídico.** Números, tabela, destaque atrasado.
- **OP-2403 Parcerias.** Números (telas N de 8, por padrão), tabela com barra de entregas das ativações, relatório atrasado.
- **OP-2404 Minha fila.** Números (conduz, finaliza, atrasados), tabela.
- **OP-2405 Operações.** Números (aguardando, confirmadas), tabela, ação "Confirmar" abre o painel.
- **OP-2406 Avisos.** Lista com ícone pelo tipo, empresa e data; "Marcar todos como lidos" e contador do sino atualizado.

## N · Norms

- N-2401 Componentes do REQ-018.

## S · Safeguards

- S-2401 Nenhuma regra ou consulta muda.

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-2402 | navegador |
| 2 | OP-2406 | navegador |
| 3 | OP-2403 | navegador |
| 4 | todas | revisão do código (todas usam `Tabela`) |
