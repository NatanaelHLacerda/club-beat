# Análise — REQ-006 — Segunda triagem: classificação e padrão
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-006-classificacao-e-padrao.md`

## Resumo

Ficha de classificação na empresa: porte calculado pelo faturamento e conferido pelos funcionários e pela Receita, aderência em cinco critérios, ficha de pontos, padrão final pelo menor entre pontos e investimento, alerta de conflito de exclusividade e o estudo da empresa. Concluir a Triagem 2 grava a data que o REQ-007 usa para passar à Gerente.

## Estado atual

- `empresas.porte`, `empresas.padrao_final` existem e estão vazios para empresas novas (`20261025000400_req-004-funil.sql`) [m].
- `empresas.categoria` e `receita_porte` vêm da Triagem 1 (`20261025002200_req-005-triagem1.sql`) [m].
- Despacho `requisitos_<etapa>` pronto [m].
- Não existe tabela de parcerias; exclusividades nascem no contrato (REQ-010/011) [m].

## Estado desejado

A Isabela preenche e vê na hora porte, pontos e padrão; conflito aparece com nome e fim do contrato; "não" no membro primeiro propõe recusa com A5; sem estudo, não conclui.

## Conceitos e domínio

- Porte pelo faturamento: Pequena até R$ 4,8 mi (DP-0602), Média I até R$ 90 mi, Média II até R$ 300 mi, Grande acima [d: cap. 6].
- Funcionários: comércio e serviços (até 49 / 50–99 / 100+), indústria (até 99 / 100–499 / 500+). "Média" pelos funcionários conta como Média I [i: exemplo do cap. 6].
- Divergência: vale o maior, com nota. Receita "demais" impede Pequena. Grupo ou franquia: pelo faturamento do grupo. Sem faturamento: provisório [d].
- Pontos 5–15: Bronze 5–7, Prata 8–11, Ouro 12–15 [d]. Faixa de investimento escolhida como Bronze/Prata/Ouro enquanto os valores não existem (DP-0601) [d].
- Master só por marcação "candidata a Master" (decisão da Direção no REQ-009) [d].
- Conflito: parceria vigente com exclusividade na mesma categoria, salvo contrato marcado para não renovar [d].

## Delta

- Banco: tabela `parcerias` mínima (empresa, situação, fim, categoria e período da exclusividade, não renovar), que o REQ-010 e o REQ-011 completam; colunas `classificacao` (jsonb), `estudo`, `candidata_master`, `triagem2_concluida_em`; `conflito_categoria(categoria)`; `salvar_classificacao`; `concluir_triagem2` (recalcula o padrão no banco); seed de uma parceira ativa com exclusividade em nutrição e alimentação.
- Regras puras: `classificarPorte`, `pontosSugeridos`, `padraoPorPontos`, `padraoFinal`, `avaliarAderencia`.
- Tela: aba "Classificação".

## Riscos

- Duas fontes do padrão (tela e banco): o banco recalcula na conclusão e prevalece [i].
- Criar `parcerias` antes do REQ-010 antecipa estrutura: mínima e só com o que o conflito usa [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 60 funcionários e R$ 3 mi | Sim | — |
| 2 10 pontos Prata | Sim | — |
| 3 13 pontos, investimento Prata | Sim | — |
| 4 Não no membro primeiro | Sim | — |
| 5 Conflito de exclusividade | Sim | depende do seed da parceira ativa |
| 6 Estudo vazio | Sim | — |

## Direção recomendada

Cálculo em funções puras testadas, conferência do padrão no banco ao concluir, ficha guardada em JSON (é um formulário fechado desta etapa) e resultados em colunas (`porte`, `padrao_final`) para filtros.

## Decisões pendentes

DP-0601 (faixas sem valor), DP-0602 (R$ 4,8 mi) e DP-0603 (Operações confirma antes da proposta, no REQ-008) pela recomendação.

## Prontidão para REASONS

Pronto.
