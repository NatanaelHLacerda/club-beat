# REQ-044 — Negociação (abas) e Histórico de encerradas
**Status:** RASCUNHO — aguardando revisão e aprovação humana
**Origem:** pedido de refatoração do CRM (Fernanda, 2026-10-26).

## Contexto
Propostas e reuniões só apareciam por etapa no quadro; "Encerrada" e "Recusada" competiam com leads ativos.

## Problema
Sem visão de negociação e com leads encerrados/perdidos misturados ao funil ativo, sem motivo à vista.

## Objetivo
Telas "Propostas em Análise", "Propostas em Negociação" e "Reuniões Agendadas"; leads Encerrados/Perdidos saem das colunas ativas e vão para "Histórico / Encerradas" com o motivo.

## Atores
Todos os que veem o CRM; mover etapa continua com quem triá.

## Regras de negócio
1. Reuniões Agendadas: etapa "Reunião marcada", da data mais próxima à mais distante.
2. Em Análise: proposta em montagem/Operações ou com a Direção.
3. Em Negociação: proposta enviada à empresa, sem aceite por escrito; prazo de resposta vencido fica destacado.
4. Encerrada e Recusada saem do quadro e da lista Geral; aparecem em Histórico com situação (Encerrada/Perdida), motivo e data.
5. Toda empresa que passa a Encerrada recebe motivo. Encerramento manual (aba Renovação): quem encerra digita o motivo, obrigatório — não entra "sem motivo informado". Encerramento automático (rotina de renovação, sem usuário): motivo derivado do contexto (decisão de não renovar, contrato sem renovação); as antigas ganham por retroativo. `mover_etapa` genérico recusa `para = 'encerrada'` — só a aba Renovação leva lá.
6. "Em espera" continua no funil (opcional no quadro).

## Escopo
### Incluído
- `negociacao.ts`(+test), regras de arquivadas em `etapas.ts`
- Telas Negociação e Histórico, rotas, menu
- Gatilho `motivo_encerramento` + retroativo
### Fora do escopo
- Reabrir empresa arquivada.
- Novas etapas no banco.

## Critérios de aceite
1. Dado uma empresa com reunião marcada, então aparece em Reuniões Agendadas.
2. Dado uma proposta enviada sem aceite, então aparece em Em Negociação.
3. Dado uma empresa encerrada ou recusada, então não aparece no quadro do Funil e aparece em Histórico com o motivo.
4. Dado uma parceria encerrada manualmente pela aba Renovação sem motivo digitado, então o encerramento é bloqueado; com motivo, o motivo é gravado tal como digitado.
5. Dado o encerramento automático pela rotina de renovação (sem usuário), então o motivo é derivado do contexto.

## Restrições
Sem dependência nova. Uma migration.

## Dependências
REQ-004, REQ-008, REQ-013

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-4401` | Como dividir Análise e Negociação? | Análise = ainda não enviada (ou com a Direção); Negociação = enviada sem aceite |
| `DP-4402` | Em espera vai ao Histórico? | Não: é pausa, não fechamento |
| `DP-4403` | Manter /empresas/recusadas? | Sim, convive com o Histórico |
| `DP-4404` | Motivo de encerramento manual: derivado pelo sistema ou digitado por quem encerra? | **Decidido (2026-10-28):** digitado por quem encerra, obrigatório, via aba Renovação; `mover_etapa` recusa `para = 'encerrada'` fora dessa aba. Automático (rotina) continua derivado. |
