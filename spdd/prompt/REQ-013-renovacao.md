# REASONS — REQ-013 — Renovação ou encerramento
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-013-renovacao.md`
**Análise:** `spdd/analysis/REQ-013-renovacao.md`

## R · Requirements

Nenhum contrato vence sem aviso, e a promessa de rever se cumpre. Fora: envio da A7 pelo WhatsApp (só modelo para copiar).

## E · Entities

- `parcerias.renovacao` (jsonb): `aviso90_em`, `aviso60_em`, `aviso30_em`, `avaliacao` (`pagamentos_em_dia`, `interesse_empresa`, `resultados`, `observacao`), `caminho` (`renovar_igual`, `renovar_mais`, `mudar_padrao`, `encerrar`), `novo_padrao`, `aguardando_direcao`, `decidida_em`, `decidida_por`, `encerramento` (checklist).

## A · Approach

`rotina_renovacoes(hoje)`: para cada parceria vigente com fim em até 90 dias e sem decisão, marca a empresa "Em renovação" e manda A6 + aviso uma vez; aos 60 e 30 dias, lembrete uma vez; parceria já vencida sem nova assinatura é encerrada. `decidir_renovacao` grava avaliação e caminho; Ouro ou Master sem ser Direção fica aguardando a Direção (aviso); caminhos de renovação abrem nova proposta. `encerrar_parceria` exige a lista de encerramento e libera a exclusividade.

## S · Structure

- `supabase/migrations/20261025003000_req-013-renovacao.sql`
- `src/regras/renovacao.ts` + `renovacao.test.ts`
- `src/dados/tipos.ts`, `src/dados/api.ts`
- `src/telas/renovacoes/Renovacoes.tsx`, `src/telas/empresa/AbaRenovacao.tsx`, `src/telas/empresa/Ficha.tsx`, `src/App.tsx`

## O · Operations

- **OP-1301 Banco.** Coluna, funções, agendamento. Verifica: SQL dos critérios 1, 2, 4 e 5 (rotina com data simulada).
- **OP-1302 Regra pura.** `marcoDeRenovacao(fim, hoje)` (90/60/30), `diasParaOFim`, `quemDecideRenovacao(padrão)`, `pendenciasEncerramento`. Verifica: testes.
- **OP-1303 Dados.** `listarRenovacoes`, `decidirRenovacao`, `confirmarRenovacao`, `encerrarParceria`.
- **OP-1304 Tela Renovações.** Vencem em até 90 dias (e as aguardando Direção), dias restantes, decisão.
- **OP-1305 Aba Renovação.** Promessa de revisão no topo; avaliação (entregas, nota dos membros, relatórios, resultados combinados, pagamentos em dia, interesse); caminho; encerramento com lista; atalho para A7.

## N · Norms

- N-1301 Regras do `CLAUDE.md`. A renovação é sempre um novo acordo por escrito.

## S · Safeguards

- S-1301 "Ouro e Master: a Direção decide a renovação." (caso fica aguardando)
- S-1302 "Marque todos os itens do encerramento."
- S-1303 Promessa de revisão sempre visível no topo quando existir.

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-1301, OP-1302 | SQL + teste |
| 2 | OP-1301, OP-1302 | SQL + teste |
| 3 | OP-1305 | navegador |
| 4 | OP-1301, OP-1305 | SQL |
| 5 | OP-1301, OP-1302 | SQL + teste |
