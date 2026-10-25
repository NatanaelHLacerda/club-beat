# REASONS — REQ-007 — Distribuição entre Gerentes e passagem de bastão
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-007-distribuicao-e-passagem.md`
**Análise:** `spdd/analysis/REQ-007-distribuicao-e-passagem.md`

## R · Requirements

Ninguém escolhe quem conduz caso a caso, e nada se perde quando o caso troca de mãos. Fora: limite de parcerias por Gerente.

## E · Entities

- `empresas.passada_em`, `empresas.distribuicao` (`revezamento`, `manual`), `empresas.passagem` (jsonb: `busca`, `apresentado`, `pediu_mais`, `prometido_rever`, `datas_interesse`, `precisa_direcao` [`nao`, `ouro_master`, `fora`, `nao_pode_perder`], `prazo_retorno`).

## A · Approach

`sugerir_gerente()` pega as Gerentes ativas e disponíveis em ordem de nome e devolve a seguinte à Gerente 1 da passagem mais recente (feita por revezamento). `passar_a_gerente` exige Triagem 2 concluída, grava Gerente 1 e responsável, motivo quando difere da sugestão, envia A2 e avisa. `definir_gerente2` exige a ficha completa quando a Gerente 2 é outra pessoa e grava o responsável final.

## S · Structure

- `supabase/migrations/20261025002400_req-007-distribuicao.sql`
- `src/regras/passagem.ts` + `passagem.test.ts`
- `src/dados/tipos.ts`, `src/dados/api.ts`
- `src/telas/empresa/AbaGerentes.tsx`, `src/telas/empresa/Ficha.tsx`
- `src/telas/fila/MinhaFila.tsx`, `src/componentes/Casca.tsx`, `src/App.tsx`

## O · Operations

- **OP-0701 Banco.** Colunas, funções, `requisitos_reuniao` recriada. Verifica: SQL dos critérios 1 a 4.
- **OP-0702 Regra pura.** `ordemFila(padrão, candidata)`, `pendenciasPassagem(ficha)`, `proximaNoRevezamento(gerentes, ultima)`. Verifica: testes.
- **OP-0703 Dados.** `sugerirGerente`, `passarAGerente`, `definirGerente2`, `listarMinhaFila`.
- **OP-0704 Aba Gerentes.** Passagem (sugestão, troca com motivo, botão), ficha de passagem, Gerente 2 e responsável final.
- **OP-0705 Minha fila.** Empresas da Gerente logada em etapas ativas, ordenadas por padrão e chegada.

## N · Norms

- N-0701 Regras do `CLAUDE.md`. A A2 não leva valor nem promessa.

## S · Safeguards

- S-0701 "Informe o motivo da troca."
- S-0702 "Preencha a ficha de passagem antes de definir a Gerente 2."
- S-0703 "Conclua a Triagem 2 antes de passar à Gerente."
- S-0704 "Nenhuma Gerente disponível."

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-0701, OP-0702 | SQL + teste |
| 2 | OP-0701 | SQL |
| 3 | OP-0701, OP-0704 | SQL + navegador |
| 4 | OP-0701, OP-0704 | navegador: caixa de saída e aviso |
