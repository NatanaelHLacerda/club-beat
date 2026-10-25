# Análise — REQ-016 — Painel de indicadores e resumo mensal
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-016-painel-e-resumo-mensal.md`

## Resumo

Painel mensal com os indicadores do cap. 13 (funil, carteira, experiência), metas editáveis pela Direção ("—" sem meta) e resumo das parcerias fechadas no mês, enviado à Direção no dia 1.

## Estado atual

- Linha do tempo com mudanças de etapa e mensagens com autor e data (REQ-004, REQ-015) [m].
- Parcerias com padrão, valor, entregas com nota dos membros, relatórios e balanços (REQ-010, REQ-011) [m].
- Calendário com datas A e situação (REQ-012); renovação com caminho e avisos (REQ-013) [m].
- `/painel` mostra "Em breve" [m].

## Estado desejado

Tela "Painel" com filtro de mês; cadastro de metas pela Direção; aviso mensal à Direção com o resumo.

## Conceitos e domínio

- "Respondida em até 2 dias úteis": primeira ação humana (mudança de etapa ou mensagem com autor) até 2 d.u. depois da chegada [i].
- "Chegou à reunião": passou por "Reunião marcada" [d].
- "Reunião virou contrato": das que chegaram à reunião, as que registraram aceite [i].
- Receita mensal: soma dos valores conhecidos das parcerias vigentes; valor ainda não definido aparece "R$ …" [d].
- Satisfação do parceiro: nota no balanço; reclamações de membros: registro simples [d] — ambos sem lugar ainda: nota no balanço e tabela de reclamações nascem aqui [i].
- Dado ausente: "—" [d].

## Delta

Banco: `metas`, `relatorios.nota_parceiro`, `reclamacoes`, `indicadores(mes)`, `rotina_resumo_mensal(hoje)` agendada no dia 1. Front: painel, metas, nota do parceiro no balanço e reclamações na aba Parceria.

## Riscos

- Contas do funil dependem do histórico: empresas de exemplo sem histórico completo entram com o que há [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 8 de 10 → 80% | Sim | — |
| 2 Sem meta → "—" | Sim | — |
| 3 Resumo no dia 1 | Sim | — |

## Direção recomendada

Indicadores calculados numa função do banco (uma consulta por painel), formatação e percentuais em função pura testada.

## Decisões pendentes

DP-1601 (metas pela Direção depois de 3 meses) pela recomendação: metas começam vazias.

## Prontidão para REASONS

Pronto.
