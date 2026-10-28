# Análise — REQ-043 — Jurídico: Minutas Contratuais e Regras de Classificação
**Status:** RASCUNHO
**Requisito:** `requirements/REQ-043-documentos-juridicos.md`

## Resumo
Duas pastas no módulo Jurídico: "Minutas Contratuais" (guardar e baixar modelos) e "Regras de Classificação (Diretrizes)" (documentos + régua de pontos em vigor).

## Estado atual
O Jurídico só tinha a lista de contratos em andamento; modelos de minuta e diretrizes de classificação ficavam fora do sistema. [m]

## Estado desejado
Duas pastas no módulo Jurídico: "Minutas Contratuais" (guardar e baixar modelos) e "Regras de Classificação (Diretrizes)" (documentos + régua de pontos em vigor).

## Delta
Banco: tabela, bucket, políticas. Dados: 4 funções em `api.ts`. Telas: `PastaDocumentos.tsx`, `Juridico.tsx`.

## Riscos
Dado existente: ver "Decisões pendentes". Sem mudança de permissão fora da citada. [i]

## Cobertura dos critérios
| Critério | Atendível |
|---|---|
| 1–4 | Sim |

## Direção recomendada
Seguir as recomendações das decisões pendentes.

## Decisões pendentes
- `DP-4301` Primeira pessoa pode ler as diretrizes? → Não nesta entrega (ver_juridico: Jurídico, Gerente, Direção)
- `DP-4302` Direção também envia documentos? → Sim

## Prontidão para REASONS
Pronto após aprovação das decisões pendentes.
