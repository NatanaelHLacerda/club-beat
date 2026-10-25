# Análise — REQ-013 — Renovação ou encerramento
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-013-renovacao.md`

## Resumo

Rotina diária coloca em "Em renovação" a parceria a 90 dias do fim, manda a A6 à Gerente e lembra aos 60 e 30 dias. A Gerente avalia (com a promessa de revisão no topo) e escolhe o caminho; Ouro e Master vão à Direção. Renovar abre uma nova proposta; encerrar libera a exclusividade e fecha a parceria.

## Estado atual

- `parcerias` com padrão, contrapartidas, promessa de revisão, responsável (REQ-010) e entregas e relatórios (REQ-011) [m].
- Modelo A6 interno e `enviar_modelo_automatico` com `data_ref` e destino (REQ-015) [m].
- `pg_cron` ativo, com a rotina das reservas (REQ-012) [m].
- `/renovacoes` mostra "Em breve" [m].

## Estado desejado

Lista "Renovações" (vencem em 90 dias) e aba "Renovação" na ficha com avaliação, caminho e encerramento.

## Conceitos e domínio

- Aviso a 90 dias, lembretes a 60 e 30 se nada foi decidido [d].
- Caminhos: renovar igual, renovar com mais benefícios, mudar de padrão, encerrar [d].
- Bronze e Prata: Gerente decide; Ouro e Master: Direção [d].
- Renovação = nova proposta e novo contrato, nunca automática [d]. A parceria atual segue até o fim [i].
- Encerrar: relatório final, retirar marca do site e telas, liberar exclusividade, atualizar o registro [d].
- Parceria vencida sem renovação assinada: a rotina encerra [i].

## Delta

Banco: `parcerias.renovacao` (jsonb), `rotina_renovacoes(hoje)` agendada, `decidir_renovacao`, `confirmar_renovacao_direcao`, `encerrar_parceria`. Front: tela e aba.

## Riscos

- A rotina roda uma vez por dia: os marcos usam "a partir de" (≤ 90 dias), não "exatamente no dia", para não perder um dia sem rotina [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Entra em renovação a 90 dias com A6 | Sim | — |
| 2 Lembrete aos 60 | Sim | — |
| 3 Promessa no topo | Sim | — |
| 4 Encerrar libera exclusividade | Sim | — |
| 5 Ouro vai à Direção | Sim | — |

## Direção recomendada

Marcos e decisão guardados na própria parceria; rotina idempotente.

## Decisões pendentes

Nenhuma na semente.

## Prontidão para REASONS

Pronto.
