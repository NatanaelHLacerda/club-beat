# Análise — REQ-004 — Funil de parcerias
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-004-funil-de-parcerias.md`

## Resumo

Nasce a entidade central do CRM, a **empresa**, com a etapa do funil, a linha do tempo e os anexos. Todos os REQs seguintes acrescentam campos e regras a ela.

## Estado atual

- Casca com rotas `/funil` e `/empresas` mostrando "Em breve" (`src/App.tsx`) [m].
- `perfis`, `meu_papel()`, `tenho_papel()` prontos para RLS (`supabase/migrations/20261025000100_req-001-acesso.sql`) [m].
- `useConsulta` para carregar dados (`src/lib/useConsulta.ts`) [m].

## Estado desejado

Funil em colunas com contagem e filtros, lista com busca, ficha da empresa com dados, anexos e linha do tempo, e troca de etapa com as regras da semente.

## Conceitos e domínio

- **Etapas** fixas (DP-0401: card pode voltar, com histórico) e duas **saídas** (Em espera, Recusada) [d: cap. 4 e 11].
- **Ativa** só pela assinatura (REQ-010); **Com a Direção** só pela porta da Direção (REQ-009) [d].
- **Responsável final**: um por empresa [d: cap. 3].
- **Campos por etapa**: cada REQ de etapa define o que precisa estar preenchido para entrar nela [d: regra 6].
- **Quem lê**: Jurídico, Financeiro e Operações leem as empresas em que foram acionados (REQ-001) [d]; aqui aproximado pela etapa [i].

## Delta

- Banco: tipos `etapa` e `origem`; tabelas `empresas` (todos os campos do formulário do cap. 5 mais porte e padrão, preenchidos no REQ-006), `historico`, `anexos`; bucket privado `anexos`.
- Funções: `mover_etapa` (única porta de mudança de etapa) e `requisitos_etapa` (verificação por etapa, que os REQs seguintes estendem); gatilho que registra edição de campos na linha do tempo (cobre o critério 4 do REQ-001).
- Regras puras: ordem e rótulos das etapas, quais exigem motivo e data.
- Telas: Funil, Empresas, Ficha.

## Riscos

- Arrastar no celular não funciona com HTML5 nativo: a troca pela ficha é obrigatória (critério 7 da semente-irmã e regra do escopo) [i].
- Gatilho de histórico em toda edição pode gerar ruído: registrar só os campos que mudaram, num único item [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Recebida e topo da lista | Sim | entrada pelo site é do REQ-002; aqui com cadastro de exemplo |
| 2 Recusada sem motivo | Sim | — |
| 3 Arrastar para Ativa | Sim | — |
| 4 Filtro Prata | Sim | padrão preenchido no REQ-006; seed de exemplo tem padrão |
| 5 Linha do tempo | Sim | — |

## Direção recomendada

Empresa como tabela larga com colunas por bloco do formulário (consultas simples, filtros diretos); mudanças sensíveis (etapa, Gerentes) só por `rpc`, com grant de `update` por coluna para os campos livres. Alternativa descartada: JSON por etapa (filtros e conflitos de categoria ficam difíceis).

## Decisões pendentes

DP-0401 (pode voltar, com histórico) e DP-0402 (Em espera não volta sozinha; gera lembrete) decididos pela recomendação.

## Prontidão para REASONS

Pronto.
