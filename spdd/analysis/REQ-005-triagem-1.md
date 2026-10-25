# Análise — REQ-005 — Primeira triagem
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-005-triagem-1.md`

## Resumo

Lista de conferência fixa na ficha, categoria da empresa com alerta de não aceita ou sensível, situação da Receita registrada à mão e pedido de informação com contagem de 7 dias. A passagem para Triagem 2 passa a exigir a lista completa.

## Estado atual

- `requisitos_etapa` existe e devolve nulo (`20261025000400_req-004-funil.sql`) [m].
- Modelos `PEDIDO_INFO` e `A5` e `registrar_mensagem` prontos (`20261025001500_req-015-mensagens.sql`) [m].
- Ficha com abas extensíveis e cartão do funil (`src/telas/empresa/Ficha.tsx`, `src/telas/funil/Funil.tsx`) [m].

## Estado desejado

Isabela marca os itens, escolhe a categoria, registra a situação na Receita; categoria não aceita encerra com A5; pedido de informação marca a data e o card fica destacado depois de 7 dias sem retorno.

## Conceitos e domínio

- **Categoria** é diferente de **segmento**: segmento é do formulário; categoria é a lista de restrição do cap. 12 [d].
- **Situação na Receita**: sem serviço de consulta (DP-0501), conferência manual com link para a consulta pública [d].
- Prazo de 1 dia útil: cobrado no REQ-014 [d].

## Delta

Banco: tabela `categorias` (editável pela Direção, DP-0502), colunas da triagem em `empresas`, gatilho que marca o pedido de informação, `requisitos_etapa` passa a despachar para `requisitos_<etapa>()` e nasce `requisitos_triagem2`. Front: aba "Triagem 1", destaque no funil, seção de categorias em "Regras e modelos".

## Riscos

- Recriar `requisitos_etapa` a cada REQ perderia regras: o despacho por nome de função evita isso [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Lista completa → Triagem 2 | Sim | — |
| 2 Apostas → não aceita + A5 | Sim | — |
| 3 Serviços financeiros → sensível | Sim | categoria "serviços financeiros" na lista de sensíveis |
| 4 7 dias sem resposta | Sim | — |
| 5 Receita "baixada" | Sim | registro manual |

## Direção recomendada

Lista como JSON de itens marcados (os itens são fixos e só servem a esta etapa); categoria em tabela própria para a Direção editar.

## Decisões pendentes

DP-0501 (consulta manual com link) e DP-0502 (lista editável pela Direção) pela recomendação.

## Prontidão para REASONS

Pronto.
