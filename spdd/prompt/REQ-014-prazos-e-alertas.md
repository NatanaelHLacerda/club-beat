# REASONS — REQ-014 — Prazos e alertas
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-014-prazos-e-alertas.md`
**Análise:** `spdd/analysis/REQ-014-prazos-e-alertas.md`

## R · Requirements

Ninguém precisa lembrar de cabeça: o CRM conta os prazos, destaca e escala. Fora: avisos por WhatsApp e envio real de e-mail.

## E · Entities

- `parametros`: `dias_escalar_direcao` = 3, `dias_empresa_parada` = 5.
- `empresas.alertas_enviados` (text[]): chaves de alertas já enviados.
- Linha de `prazos_abertos()`: `empresa_id`, `marca`, `etapa`, `descricao`, `prazo`, `responsavel_id`, `situacao` (`no_prazo`, `vence_hoje`, `atrasado`).

## A · Approach

`prazos_abertos(hoje)` deriva o prazo atual de cada empresa a partir dos campos que cada etapa já guarda. `rotina_prazos(hoje)` percorre os mesmos dados e gera avisos com chave única: contato da Gerente (outra Gerente, depois Direção), Direção vencida, empresa parada, véspera de reunião, retomar Em espera, relatório mensal atrasado. Agendada às 6h10 de Brasília.

## S · Structure

- `supabase/migrations/20261025003100_req-014-prazos.sql`
- `src/regras/prazos.ts` + `prazos.test.ts`
- `src/dados/tipos.ts`, `src/dados/api.ts`
- `src/telas/prazos/Prazos.tsx`, `src/telas/funil/Funil.tsx`, `src/telas/config/Regras.tsx`, `src/componentes/Casca.tsx`, `src/App.tsx`

## O · Operations

- **OP-1401 Banco.** Parâmetros, coluna, `hoje_sp()`, `dias_uteis_entre`, `prazos_abertos`, `rotina_prazos`, agendamento. Verifica: SQL dos critérios com datas simuladas.
- **OP-1402 Regra pura.** `situacaoDoPrazo(prazo, hoje)`, `rotuloSituacao`, `somarDiasUteis` (reuso do REQ-009). Verifica: testes (sexta → segunda).
- **OP-1403 Dados.** `listarPrazos`, `cadastrarFeriado`, `apagarFeriado`.
- **OP-1404 Funil.** Card com o prazo da etapa (vence hoje / atrasado).
- **OP-1405 Tela Prazos.** Atrasados, vencem hoje, no prazo; filtro "só os meus"; seção "Paradas".
- **OP-1406 Feriados.** Seção em "Regras e modelos" para Direção e 1ª pessoa.

## N · Norms

- N-1401 Regras do `CLAUDE.md`; datas na data de São Paulo.

## S · Safeguards

- S-1401 Um mesmo alerta nunca é enviado duas vezes (chave em `alertas_enviados`).
- S-1402 Rótulos: "No prazo", "Vence hoje", "Atrasado".

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-1401, OP-1402 | teste + SQL |
| 2 | OP-1401 | SQL |
| 3 | OP-1401 | SQL |
| 4 | OP-1401, OP-1405 | SQL + navegador |
