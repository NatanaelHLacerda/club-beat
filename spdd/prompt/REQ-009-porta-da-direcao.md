# REASONS — REQ-009 — Porta da Direção
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-009-porta-da-direcao.md`
**Análise:** `spdd/analysis/REQ-009-porta-da-direcao.md`

## R · Requirements

Nenhuma exceção é prometida sem a Direção saber e decidir. Fora: assinatura digital da decisão.

## E · Entities

- `feriados` (`data`, `nome`).
- `empresas.direcao` (jsonb): `levada_em`, `motivos`, `recomendacao`, `prazo`, `decisao` (`aprovar`, `ajustar`, `recusar`), `motivo`, `decidida_em`, `decidida_por`.
- `empresas.fila_master` (bool).

## A · Approach

`levar_a_direcao(empresa, recomendacao)` exige motivos, guarda o retrato e o prazo (3 dias úteis) e move para "Com a Direção", avisando a Direção. `decidir_direcao(empresa, decisao, motivo, como_master, destino_recusa, retomar)` só para Direção: aprova (marca `direcao_aprovada_em`; Master só com vaga livre, senão Ouro e fila), ajusta ou recusa; grava histórico e avisa a Gerente.

## S · Structure

- `supabase/migrations/20261025002700_req-009-direcao.sql`
- `src/regras/direcao.ts` + `direcao.test.ts`
- `src/dados/tipos.ts`, `src/dados/api.ts`
- `src/telas/empresa/AbaDirecao.tsx`, `src/telas/empresa/AbaProposta.tsx`, `src/telas/empresa/Ficha.tsx`
- `src/telas/direcao/Direcao.tsx`, `src/componentes/Casca.tsx`, `src/App.tsx`

## O · Operations

- **OP-0901 Banco.** `feriados`, `somar_dias_uteis(data, n)`, colunas, `vaga_master_ocupada()`, `levar_a_direcao`, `decidir_direcao`. Verifica: SQL dos critérios.
- **OP-0902 Regra pura.** `somarDiasUteis(data, n, feriados)`, `destinoDaDecisao(decisao, temAceite)`. Verifica: testes.
- **OP-0903 Dados.** `levarADirecao`, `decidirDirecao`, `listarParaDirecao`, `vagaMasterOcupada`.
- **OP-0904 Aba Direção.** Resumo de 1 página (empresa, padrão, valor, contrapartidas, datas reservadas, riscos, recomendação), decisão para a Direção, histórico da decisão para os demais.
- **OP-0905 Tela Direção.** Fila dos casos com prazo (vencido destacado).
- **OP-0906 Proposta.** Com motivos: campo de recomendação e "Levar à Direção".

## N · Norms

- N-0901 Regras do `CLAUDE.md`. Decisão sempre com motivo.

## S · Safeguards

- S-0901 Sem motivo de Direção: "Esta proposta não precisa da Direção: a Gerente fecha."
- S-0902 "Informe o motivo da decisão."
- S-0903 "A vaga de Master está ocupada. Aprove como Ouro e coloque na fila do Master."
- S-0904 Só o papel Direção decide (RLS e função).

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-0901, OP-0906 | navegador |
| 2 | OP-0901 | SQL |
| 3 | OP-0901, OP-0904 | SQL + navegador |
| 4 | OP-0901, OP-0902 | teste (prazo) |
| 5 | OP-0901, OP-0904 | SQL |
