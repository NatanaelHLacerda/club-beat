# REASONS — REQ-016 — Painel de indicadores e resumo mensal
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-016-painel-e-resumo-mensal.md`
**Análise:** `spdd/analysis/REQ-016-painel-e-resumo-mensal.md`

## R · Requirements

Poucos números, revisados todo mês, mostram se o funil anda e se a carteira está equilibrada. Fora: comparativos de anos anteriores.

## E · Entities

- `metas` (`indicador`, `valor`, `atualizado_por`, `atualizado_em`).
- `relatorios.nota_parceiro` (1–5, só em balanço).
- `reclamacoes` (`parceria_id`, `data`, `texto`, `autor_id`).
- Resultado de `indicadores(mes)` (jsonb): `chegaram`, `respondidas_2du`, `chegaram_reuniao`, `reunioes`, `viraram_contrato`, `dias_ate_contrato`, `recusadas_nao_combina`, `ativas_por_padrao`, `receita_centavos`, `receita_sem_valor`, `renovadas`, `decididas_renovacao`, `datas_a_total`, `datas_a_ocupadas`, `vencendo_sem_aviso`, `nota_membros`, `nota_parceiro`, `reclamacoes_trimestre`, `fechadas` (lista do mês).

## A · Approach

`indicadores(mes)` calcula tudo de uma vez a partir do histórico e das tabelas. A tela formata com `src/regras/indicadores.ts` (percentual com "—" quando não há base, comparação com meta). `rotina_resumo_mensal(hoje)` roda no dia 1 e avisa a Direção com as parcerias fechadas no mês anterior (padrão e valor), sem pedir aprovação.

## S · Structure

- `supabase/migrations/20261025003200_req-016-painel.sql`
- `src/regras/indicadores.ts` + `indicadores.test.ts`
- `src/dados/tipos.ts`, `src/dados/api.ts`
- `src/telas/painel/Painel.tsx`, `src/telas/empresa/AbaParceria.tsx`, `src/App.tsx`

## O · Operations

- **OP-1601 Banco.** Tabelas, coluna, `indicadores`, `rotina_resumo_mensal`, agendamento. Verifica: SQL.
- **OP-1602 Regra pura.** `percentual(parte, total)`, `formatarIndicador`, `comparaMeta`. Verifica: testes (80%, "—").
- **OP-1603 Dados.** `obterIndicadores(mes)`, `listarMetas`, `salvarMeta`, `registrarReclamacao`, `listarReclamacoes`.
- **OP-1604 Painel.** Filtro de mês; três blocos (funil, carteira, experiência) com valor e meta; parcerias fechadas no mês; Direção edita metas.
- **OP-1605 Aba Parceria.** Nota do parceiro no registro do balanço; reclamações de membros.

## N · Norms

- N-1601 Regras do `CLAUDE.md`: dado ausente "—", valor sem definição "R$ …".

## S · Safeguards

- S-1601 Indicador sem base no mês: "—", nunca 0%.
- S-1602 Reclamações sem identificar o membro.

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-1602, OP-1604 | teste |
| 2 | OP-1604 | navegador |
| 3 | OP-1601 | SQL (rotina com data simulada) |
