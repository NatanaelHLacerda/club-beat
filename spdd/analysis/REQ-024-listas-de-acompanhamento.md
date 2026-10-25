# Análise — REQ-024 — Listas de acompanhamento no novo visual
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-024-listas-de-acompanhamento.md`

## Resumo

Oito listas de trabalho passam a ter o mesmo cabeçalho de números e a mesma `Tabela` do REQ-018, com destaque de atraso; Avisos vira lista no estilo "Task overview" com "Marcar todos como lidos"; Parcerias mostra barra de entregas; a confirmação de Operações vai para um painel lateral.

## Estado atual

- `src/telas/parcerias/Parcerias.tsx`, `renovacoes/Renovacoes.tsx`, `prazos/Prazos.tsx`, `fila/MinhaFila.tsx`, `direcao/Direcao.tsx`, `juridico/Juridico.tsx`: tabelas próprias [m].
- `operacoes/Operacoes.tsx`: um cartão com formulário por proposta [m].
- `avisos/Avisos.tsx`: lista com "Marcar como lido" um a um [m].
- `Tabela`, `CartaoNumero`, `Progresso`, `Avatar`, `PainelLateral` prontos [m].

## Estado desejado

Mesmo padrão em todas: números de resumo, tabela com avatar, pills, data com ícone, ações por ícone, linha atrasada marcada.

## Conceitos e domínio

- "Atrasado" vem das regras já existentes (prazo, relatório, decisão, minuta) [m].

## Delta

Oito telas reescritas; `marcarTodosAvisosLidos` em `api.ts`; `Confirmacao` de Operações dentro do `PainelLateral`; componente `DataComIcone`.

## Riscos

Nenhum além do visual: regras e consultas não mudam [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Prazos atrasados | Sim | — |
| 2 Marcar todos como lidos | Sim | — |
| 3 Barra 3/8 | Sim | — |
| 4 Mesma tabela | Sim | — |

## Direção recomendada

Trocar a marcação de cada tela pelos componentes comuns, sem tocar em dados.

## Decisões pendentes

Nenhuma.

## Prontidão para REASONS

Pronto.
