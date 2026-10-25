# Análise — REQ-012 — Calendário anual de eventos
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-012-calendario-anual.md`

## Resumo

Calendário compartilhado com datas A/B/C, janela de escolha por padrão, reserva provisória de 7 dias que expira sozinha, confirmação na assinatura e limites do mês para proteger o membro.

## Estado atual

- `/calendario` mostra "Em breve" (`src/App.tsx`) [m].
- `empresas.padrao_final` e `candidata_master` existem (REQ-006) [m].
- `avisar_usuario` pronto (REQ-002) [m]. Não há rotina agendada no banco [m].

## Estado desejado

Direção (e Isabela) cadastram as datas do ano e as janelas; Gerentes reservam para empresas em conversa; o banco recusa o que fura a prioridade, a véspera, a ocupação e os limites; reservas vencidas voltam a Livre e a Gerente é avisada.

## Conceitos e domínio

- Tipo A: manhãs e sábados; prioridade por padrão dentro das janelas (Master e Ouro → Prata → Bronze) [d].
- Tipo B e C: ordem de chegada (a semente põe a janela nas datas disputadas; o cap. 10 manda B e C por chegada) [d].
- Véspera de feriado: só Bronze e Prata [d].
- Reserva provisória: 7 dias; "Confirmada" só com a assinatura (REQ-010) [d].
- Limites do Club no mês: um tipo de ação e 4 dias de ação [d]; 8 marcas nas telas é do REQ-011 [i].
- "Proposta prevê a ação": a proposta nasce no REQ-008; aqui a reserva exige empresa em reunião, proposta, Direção ou contrato, e a função `empresa_preve_acao` fica pronta para o REQ-008 completar [i].
- Agendamento diário com `pg_cron` [i].

## Delta

Banco: `calendario_datas`, `janelas_escolha`, `reservar_data`, `liberar_data`, `confirmar_datas_da_empresa`, `trocar_data`, `liberar_reservas_vencidas` (agendada), parâmetro `antecedencia_troca_dias` (30, DP-1203). Seed: datas e janelas de exemplo. Front: tela Calendário (ano e mês), cadastro de datas e janelas, reserva.

## Riscos

- Corrida em duas reservas da mesma data: bloqueio da linha na função [i].
- `pg_cron` precisa existir no banco hospedado [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Janela de Master e Ouro | Sim | — |
| 2 Reserva vence em 7 dias | Sim | — |
| 3 Data confirmada | Sim | confirmação vem do REQ-010; aqui pelo seed |
| 4 Véspera de feriado | Sim | — |

## Direção recomendada

Regras de reserva numa função única no banco, espelhadas por função pura para a tela explicar o bloqueio antes de tentar.

## Decisões pendentes

DP-1201 (datas: Direção cadastra; o seed traz exemplos), DP-1202 (15 dias por janela como sugestão no cadastro) e DP-1203 (30 dias) pela recomendação.

## Prontidão para REASONS

Pronto.
