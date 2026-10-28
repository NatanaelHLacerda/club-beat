# REASONS — REQ-044 — Negociação (abas) e Histórico de encerradas
**Status:** RASCUNHO
**Requisito:** `requirements/REQ-044-negociacao-e-historico.md`
**Análise:** `spdd/analysis/REQ-044-negociacao-e-historico.md`

## R · Requirements
Telas "Propostas em Análise", "Propostas em Negociação" e "Reuniões Agendadas"; leads Encerrados/Perdidos saem das colunas ativas e vão para "Histórico / Encerradas" com o motivo.

## E · Entities
Ver delta da análise.

## A · Approach
Banco: `mover_etapa` recusa `para = 'encerrada'` (só a aba Renovação leva lá); `encerrar_parceria` passa a exigir `motivo text` (obrigatório, bloqueia se vazio); gatilho `motivo_encerramento` cobre só o caminho automático (rotina de renovação, sem usuário) + retroativo. Regras: `etapas.ts`, `negociacao.ts`, `renovacao.ts`. Telas: `Negociacao.tsx`, `Historico.tsx`, `TelaEmpresas.tsx`, `AbaRenovacao.tsx`, `Casca.tsx`, `App.tsx`.

## S · Structure
`src/regras/{etapas,negociacao,renovacao}.ts`(+tests) · `src/telas/{negociacao/Negociacao,empresas/Historico,empresas/TelaEmpresas,empresa/AbaRenovacao}.tsx` · `src/dados/api.ts` · migration 20261026060000

## O · Operations
- **OP-4401 Regras.** Arquivadas em `etapas.ts` (bloqueia `para='encerrada'` fora da aba Renovação); `negociacao.ts` + testes; `motivoEncerramentoValido` em `renovacao.ts` + teste.
- **OP-4402 Banco.** Migration `20261026060000`: `mover_etapa` recria recusando `encerrada`; `encerrar_parceria` recriada com `motivo text` obrigatório; gatilho só cobre a rotina automática.
- **OP-4403 Telas.** Negociação, Histórico, quadro sem arquivadas, menu e rotas; `AbaRenovacao.tsx` pede o motivo antes de "Encerrar parceria".

## N · Norms
- N-4401 Etapas do banco não mudam.
- N-4402 Encerramento manual sem motivo digitado é bloqueado (DP-4404); só o caminho automático (sem usuário) deriva o motivo.

## S · Safeguards
- S-4401 Empresa arquivada continua abrindo pela ficha.
- S-4402 `encerrar_parceria` e `mover_etapa` são `security definer`: a tela não burla a exigência de motivo com um `update` direto.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1–4 | OP-4401, OP-4402, OP-4403 | teste de regra + navegador |
