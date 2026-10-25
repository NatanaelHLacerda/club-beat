# Análise — REQ-008 — Reunião e proposta
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-008-reuniao-e-proposta.md`

## Resumo

Registrar a reunião (agenda e anotações), montar a proposta só com itens do cardápio do padrão, pedir a confirmação de Operações, enviar com prazo de resposta e registrar o aceite com anexo. Pedido fora da autonomia da Gerente vai para a Direção.

## Estado atual

- `requisitos_reuniao` exige Triagem 2 concluída e Gerente (`20261025002400_req-007-distribuicao.sql`) [m].
- Operações lê empresas a partir de "Em proposta" (`pode_ler_empresa`, REQ-004) [m].
- `empresa_preve_acao` devolve sempre verdadeiro, esperando este REQ (`20261025002500_req-012-calendario.sql`) [m].
- `anexos` aceita tipo `aceite` [m]. Modelos A3 e A4 prontos [m].

## Estado desejado

Aba "Reunião e proposta" na ficha; cardápio editável pela Direção em "Regras e modelos"; tela de Operações confirmando a viabilidade.

## Conceitos e domínio

- **Cardápio** (cap. 8): itens por padrão com quantidade máxima; o que não tem número no documento fica como texto e "a combinar" [d].
- **Formato** (contínua, pontual, evento, aula fechada) e **tipo** (patrocínio, indústria, serviço, troca) [d].
- **Operações confirma** capacidade, equipe, espaço/horário e custo interno antes do envio (DP-0803: pelo CRM) [d].
- **Precisa da Direção**: Ouro, Master ou candidata; item fora do cardápio; exclusividade; Club paga (serviço); categoria sensível; "parceiro que não pode perder" [d: cap. 9]. Pela ordem do cap. 4, a proposta que precisa da Direção não sai antes da decisão; o aceite de algo que precisa dela leva o card para "Com a Direção" (critério 5) [d].
- **Prazo de resposta** 7 dias; **sem acordo** → Em espera, retomar em 6 meses [d].
- **Promessa de revisão** fica registrada para a renovação [d].

## Delta

Banco: `cardapio` (seed do cap. 8), colunas `reuniao`, `formato`, `tipo_parceria`, `proposta`, `operacoes` (jsonb); funções `salvar_reuniao`, `salvar_proposta` (valida contra o cardápio), `confirmar_operacoes`, `motivos_direcao`, `enviar_proposta`, `registrar_aceite`; `requisitos_reuniao` e `empresa_preve_acao` recriadas. Front: aba, tela de Operações, seção do cardápio.

## Riscos

- Valores pendentes (DP-0801): valor mensal opcional, mostrado "R$ …" quando vazio [d].
- A Direção decide no REQ-009: aqui só as travas e o encaminhamento [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Só cardápio Prata, até 4 ativações | Sim | — |
| 2 Sem Operações não envia | Sim | — |
| 3 Prazo vencido destacado | Sim | — |
| 4 Aceite Bronze/Prata → contrato | Sim | — |
| 5 Fora do cardápio → Direção | Sim | decisão no REQ-009 |

## Direção recomendada

Cardápio em tabela (Direção ajusta sem deploy); proposta e confirmação de Operações em JSON na empresa (um documento por etapa); travas no banco.

## Decisões pendentes

DP-0801 a DP-0803 pela recomendação.

## Prontidão para REASONS

Pronto.
