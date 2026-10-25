# Análise — REQ-011 — Parcerias ativas e acompanhamento
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-011-parcerias-ativas.md`

## Resumo

Lista de parcerias ativas com contratado × entregue, registro de entregas (com fotos), aprovação de material, relatórios e balanços com prazo calculado, nota dos membros por ativação e as travas de privacidade e de limites.

## Estado atual

- A assinatura cria `parcerias` com padrão, tipo, valor, contrapartidas, datas e responsável (`20261025002800_req-010-contrato.sql`) [m].
- `/parcerias` mostra "Em breve" [m]. `anexos` aceita tipo `entrega` [m].
- O calendário já trava um tipo de ação e 4 dias por mês nas reservas (REQ-012) [m].

## Estado desejado

Tela "Parcerias ativas" e aba "Parceria" na ficha, com entregas, materiais, relatórios e balanços; avisos de relatório e balanço vencidos aparecem na lista (o aviso agendado é do REQ-014).

## Conceitos e domínio

- **Contratado × feito** por item do cardápio (ex.: "Ativações 1/4") [d].
- **Medidas do material** em até 10 dias da assinatura; ações em até 30 dias [d].
- **Relatório**: Ouro e Master todo mês até o dia 10; Bronze e Prata a cada 3 meses. **Balanço** a cada 3 meses [d].
- **Privacidade** antes de cada ativação: marcação obrigatória [d].
- **Limites do mês**, para o Club todo (DP-1101) [d]; **telas** com no máximo 8 marcas ao mesmo tempo [d: cap. 8].
- **Nota dos membros** de 1 a 5 por ativação, sem identificar ninguém [d].

## Delta

Banco: `entregas`, `materiais`, `relatorios`, colunas `medidas_informadas_em` e `anexos.entrega_id`; trava de 8 marcas nas telas; funções de registro. Regras puras de prazo de relatório e de contagem. Front: lista e aba.

## Riscos

- Itens sem número (redes "poucas divulgações") não têm contratado: mostram só o feito [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Ativações 1/4 | Sim | — |
| 2 Relatório Ouro atrasado no dia 11 | Sim | — |
| 3 Ativação sem privacidade | Sim | — |
| 4 Outro tipo no mesmo mês | Sim | — |

## Direção recomendada

Tabelas próprias para entregas, materiais e relatórios (são listas que crescem); prazos calculados por função pura e testada.

## Decisões pendentes

DP-1101 pela recomendação (limites valem para o Club todo).

## Prontidão para REASONS

Pronto.
