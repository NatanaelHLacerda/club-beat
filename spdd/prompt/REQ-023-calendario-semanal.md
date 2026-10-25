# REASONS — REQ-023 — Calendário em visão de semana e de mês
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-023-calendario-semanal.md`
**Análise:** `spdd/analysis/REQ-023-calendario-semanal.md`

## R · Requirements

Ver a semana e o mês de forma visual, com as mesmas regras de reserva. Fora: mudanças no REQ-012.

## E · Entities

- `Visao`: `semana` | `mes` | `ano`.
- Grade do mês: semanas × 7 dias (`data`, `doMes`).

## A · Approach

Datas do ano (ou dos dois anos da semana) carregadas uma vez; a visão filtra. Blocos posicionados pela hora (6h às 22h). Clique abre `PainelLateral` com os dados da data e `AcoesDaData`.

## S · Structure

- `src/regras/semana.ts` + `semana.test.ts`
- `src/telas/calendario/Calendario.tsx` (visões), `src/telas/calendario/Visoes.tsx`
- `src/estilo.css`

## O · Operations

- **OP-2301 Regras.** `inicioDaSemana`, `diasDaSemana`, `somarDias`, `gradeDoMes`, `minutosDoHorario`.
- **OP-2302 Bloco.** Aula, horário, empresa, selo A, véspera; classe pela situação.
- **OP-2303 Semana.** Cabeçalho com dias (hoje destacado), linhas de hora, blocos; celular: um dia com setas.
- **OP-2304 Mês.** Grade 7 × semanas, até 3 blocos e "+N" (abre o dia na semana).
- **OP-2305 Tela.** Alternância Semana/Mês/Ano, navegação e "Hoje", painel lateral com ações; janelas e cadastro mantidos.

## N · Norms

- N-2301 Componentes do REQ-018; regras do `CLAUDE.md`.

## S · Safeguards

- S-2301 Mensagens de bloqueio do REQ-012 inalteradas.

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-2301, OP-2303 | teste + navegador |
| 2 | OP-2302 | navegador |
| 3 | OP-2305 | navegador |
| 4 | OP-2303 | navegador 375 px |
