# REASONS — REQ-012 — Calendário anual de eventos
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-012-calendario-anual.md`
**Análise:** `spdd/analysis/REQ-012-calendario-anual.md`

## R · Requirements

A mesma data nunca é prometida a dois parceiros, e a prioridade por padrão é justa e explicável. Fora: integração com a grade de aulas.

## E · Entities

- `calendario_datas`: `data`, `tipo` (`A`, `B`, `C`), `vespera_feriado`, `aula`, `horario`, `media_alunos`, `tema`, `situacao` (`livre`, `reservada`, `confirmada`), `empresa_id`, `tipo_acao` (`ativacao`, `evento`, `aula_fechada`), `reservada_em`, `reservada_ate`, `reservada_por`.
- `janelas_escolha`: `ano`, `grupo` (`master_ouro`, `prata`, `bronze`), `abre_em`, `fecha_em`.
- `parametros.antecedencia_troca_dias` = 30.

## A · Approach

`reservar_data(data, empresa, tipo_acao)` confere, nesta ordem: papel; data livre; empresa em etapa de conversa e `empresa_preve_acao`; véspera (só Bronze e Prata); tipo A dentro da janela do padrão; limites do mês (um tipo de ação, 4 dias). Grava reserva por 7 dias. `liberar_reservas_vencidas` volta a Livre e avisa quem reservou; agendada no `pg_cron` às 6h. `confirmar_datas_da_empresa` (chamada no REQ-010) troca Reservada por Confirmada. `trocar_data` exige pedido por escrito e antecedência.

## S · Structure

- `supabase/migrations/20261025002500_req-012-calendario.sql`
- `supabase/seed.sql` — datas e janelas de exemplo.
- `src/regras/calendario.ts` + `calendario.test.ts`
- `src/dados/tipos.ts`, `src/dados/api.ts`
- `src/telas/calendario/Calendario.tsx`, `src/App.tsx`

## O · Operations

- **OP-1201 Banco.** Tabelas com RLS (leitura por todos os papéis do CRM; escrita por funções; cadastro por Direção e 1ª pessoa), funções, agendamento. Verifica: SQL dos critérios.
- **OP-1202 Regra pura.** `grupoDoPadrao`, `janelaAberta(janelas, padrão, hoje)`, `bloqueioDeReserva(data, empresa, janelas, ocupadasNoMes, hoje)`. Verifica: testes.
- **OP-1203 Dados.** `listarDatas(ano)`, `listarJanelas(ano)`, `salvarData`, `salvarJanela`, `reservarData`, `liberarData`, `trocarData`, `listarEmpresasParaReserva`.
- **OP-1204 Tela.** Ano em 12 meses com contagem por situação; mês com a lista (data, tipo, aula, horário, alunos, tema, padrão com prioridade, empresa, situação); reservar com empresa e tipo de ação, mostrando o bloqueio antes; liberar e trocar; cadastro de datas e janelas para quem pode `publicar_calendario`.

## N · Norms

- N-1201 Regras do `CLAUDE.md`. Situações: "Livre", "Reservada (até dd/mm)", "Confirmada".

## S · Safeguards

- S-1201 Fora da janela: "Datas A: agora escolhem <grupo>. A janela de <padrão> abre em dd/mm."
- S-1202 "Véspera de feriado: só empresas Bronze e Prata."
- S-1203 "Esta data já está reservada ou confirmada."
- S-1204 "Este mês já tem outro tipo de ação." / "Este mês já tem 4 dias de ação."
- S-1205 "A empresa precisa estar em conversa (reunião, proposta, Direção ou contrato) para reservar."
- S-1206 Troca: "Peça a troca por escrito com pelo menos N dias de antecedência."

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-1201, OP-1202, OP-1204 | teste + SQL + navegador |
| 2 | OP-1201 | SQL (rotina com data ajustada) |
| 3 | OP-1201 | SQL |
| 4 | OP-1201, OP-1202 | teste + SQL |
