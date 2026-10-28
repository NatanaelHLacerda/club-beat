# REASONS — REQ-041 — Manutenção / Configurações: pontuação configurável
**Status:** RASCUNHO
**Requisito:** `requirements/REQ-041-manutencao-pontuacao.md`
**Análise:** `spdd/analysis/REQ-041-manutencao-pontuacao.md`

## R · Requirements
Item "Manutenção / Configurações" no menu lateral, com tela para editar cortes de pontos, critérios, pontos de cada opção e faixas de investimento. Nada da pontuação fica fixo.

## E · Entities
Ver delta da análise.

## A · Approach
Banco: 3 chaves em `parametros`; funções `salvar_config_pontuacao`, `soma_pontos_ficha`; `padrao_por_pontos` passa a ler `pontuacao_cortes`; `concluir_triagem2` soma pela configuração. Regras: `classificacao.ts`. Telas: `Manutencao.tsx`, `AbaClassificacao.tsx`.

## S · Structure
`src/regras/classificacao.ts`(+test) · `src/lib/permissoes.ts`(+test) · `src/dados/api.ts` · `src/telas/manutencao/Manutencao.tsx` · `src/telas/empresa/AbaClassificacao.tsx` · `src/componentes/Casca.tsx` · `src/App.tsx` · migration 20261026030000

## O · Operations
- **OP-4101 Regras.** Parametrizar `classificacao.ts` (config, validação, leitura com fallback, faixas) e testes.
- **OP-4102 Banco.** Migration `20261026030000`: seed, `padrao_por_pontos`, `soma_pontos_ficha`, `salvar_config_pontuacao`, `concluir_triagem2`.
- **OP-4103 Dados.** `lerPontuacao`, `salvarPontuacao` em `api.ts`.
- **OP-4104 Telas.** Tela Manutenção, rota, menu, permissão `manter_sistema`; ficha de pontos usa a configuração.

## N · Norms
- N-4101 Permissão só por `pode()`; o banco repete (direção/admin).
- N-4102 Dinheiro em centavos; "R$ …" quando indefinido.

## S · Safeguards
- S-4101 Configuração inválida nunca trava a Triagem 2 (fallback para o padrão).
- S-4102 Classificações concluídas não mudam.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1–5 | OP-4101, OP-4102, OP-4103, OP-4104 | teste de regra + navegador |
