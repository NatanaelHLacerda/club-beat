# Análise — REQ-009 — Porta da Direção
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-009-porta-da-direcao.md`

## Resumo

A Gerente leva à Direção a proposta que tem motivo (lista do REQ-008), com recomendação; a Direção vê o resumo de uma página e aprova, ajusta ou recusa com motivo, dentro de 3 dias úteis. A vaga única de Master é controlada, com fila.

## Estado atual

- `motivos_direcao`, `enviar_proposta` (bloqueia sem aprovação) e `registrar_aceite` (leva a "Com a Direção") prontos (`20261025002600_req-008-proposta.sql`) [m].
- `proposta.direcao_aprovada_em` já é lido pelo envio [m].
- `mover_etapa` bloqueia "Com a Direção" e manda usar a porta da Direção [m].
- Não há tabela de feriados nem contagem de dias úteis no banco [m].

## Estado desejado

Botão "Levar à Direção" na proposta; tela "Direção" com a fila de decisões e o resumo; decisão grava e devolve o card ao lugar certo, avisando a Gerente.

## Conceitos e domínio

- Prazo de 3 dias úteis; vencido, novo aviso (o aviso automático entra no REQ-014, que agenda as rotinas) [d].
- Aprovar: volta à proposta para envio, ou vai a "Em contrato" se o aceite já existe [d: regra 6 + cap. 4].
- Ajustar: volta a "Em proposta" com a nota visível [d].
- Recusar: Em espera ou Recusada, com motivo [d].
- Master: vaga única; ocupada → entrar como Ouro e ficar na fila [d].
- Dias úteis: sem sábado, domingo e feriados cadastrados [d: CLAUDE.md]. A tabela de feriados nasce aqui; o cadastro pela tela é do REQ-014 [i].

## Delta

Banco: `feriados`, `somar_dias_uteis`, colunas `direcao` (jsonb) e `fila_master`, `levar_a_direcao`, `decidir_direcao`, `vaga_master_ocupada`. Front: ação na aba de proposta, aba "Direção" na ficha (resumo), tela "Direção".

## Riscos

- Decisão aprovada e depois a proposta mudar: `salvar_proposta` já não apaga a aprovação; ao mudar itens, Operações confirma de novo. A aprovação vale para a versão decidida; a Gerente leva de novo se mudar o que foi aprovado [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Exclusividade → Direção | Sim | — |
| 2 Prata no cardápio não passa | Sim | — |
| 3 Ajustar volta à proposta | Sim | — |
| 4 3 dias úteis | Parcial | prazo calculado aqui; aviso automático no REQ-014 |
| 5 Vaga Master | Sim | — |

## Direção recomendada

Decisão como função única no banco, só para o papel Direção; resumo montado a partir dos dados já guardados.

## Decisões pendentes

DP-0901 (mínimo vem dos valores da Direção) e DP-0902 (valor da exclusividade) seguem pendentes de valores; o motivo "valor abaixo do mínimo" entra quando houver valores.

## Prontidão para REASONS

Pronto.
