# Análise — REQ-014 — Prazos e alertas
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-014-prazos-e-alertas.md`

## Resumo

Uma função no banco calcula, para cada empresa em andamento, o prazo da etapa em dias úteis e a situação (no prazo, vence hoje, atrasado). A tela usa essa mesma função para destacar cards e listar prazos; uma rotina diária escala e avisa, uma vez por ocorrência.

## Estado atual

- `somar_dias_uteis` e `feriados` (nacionais fixos 2026–2027) existem (REQ-009) [m].
- Prazos já guardados: `direcao.prazo` (REQ-009), `contrato.prazo_juridico` e `prazo_assinatura` (REQ-010), `proposta.prazo_resposta` (REQ-008) [m].
- Avisos e central existem (REQ-002); `pg_cron` roda reservas e renovações [m].

## Estado desejado

Funil com a situação do prazo em cada card; tela "Prazos" com atrasados, vencendo hoje e paradas; cadastro de feriados; escalonamento automático.

## Conceitos e domínio

- Prazos por etapa (resumo do cap. 4): Triagem 1 = 1 d.u.; Triagem 2 = 2 d.u.; passagem no mesmo dia; contato da Gerente = 2 d.u.; proposta = 2 d.u.; resposta = 7 dias; Jurídico = 5 d.u.; Direção = 3 d.u.; assinatura = 2 d.u. [d].
- "Contato feito": mensagem registrada pela Gerente depois da passagem ou reunião marcada [i].
- Escalonamento: 2 d.u. sem contato → outra Gerente; mais N d.u. → Direção (DP-1401: 3). Direção vencida → novo aviso e lembrete à Gerente [d].
- Empresa parada: mesma etapa há mais de N d.u. (DP-1402: 5) [d].
- Lembretes que outros REQs deixaram para cá: véspera da reunião (REQ-008), retomar "Em espera" (DP-0402), relatório mensal atrasado de Ouro e Master (REQ-011) [d].
- E-mail dos avisos depende de provedor (parada da cadeia): os avisos ficam no CRM [d].

## Delta

Banco: parâmetros, `empresas.alertas_enviados`, `prazos_abertos()`, `rotina_prazos(hoje)` agendada. Front: regras de situação, Funil, tela Prazos, feriados em "Regras e modelos".

## Riscos

- Fuso: dias contados na data de São Paulo [d].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Sexta → segunda | Sim | — |
| 2 Aviso à outra Gerente | Sim | — |
| 3 Direção vencida | Sim | — |
| 4 Empresa parada | Sim | — |

## Direção recomendada

Cálculo único no banco (a tela e a rotina usam o mesmo), alertas idempotentes por chave.

## Decisões pendentes

DP-1401 (3 d.u.) e DP-1402 (5 d.u.) pela recomendação, como parâmetros.

## Prontidão para REASONS

Pronto.
