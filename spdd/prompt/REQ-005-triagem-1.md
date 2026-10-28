# REASONS — REQ-005 — Primeira triagem
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-005-triagem-1.md`
**Análise:** `spdd/analysis/REQ-005-triagem-1.md`

## R · Requirements

Conferir se há informação suficiente para classificar, com roteiro fixo. Fora: aderência ao membro (REQ-006).

## E · Entities

- `categorias` (`nome`, `situacao`: `aceita`, `nao_aceita`, `sensivel`, `ordem`).
- `empresas`: `categoria`, `triagem1` (jsonb de itens marcados), `receita_situacao` (`ativa`, `baixada`, `suspensa`, `inapta`, `nula`), `receita_porte` (`ME`, `EPP`, `demais`), `pedido_info_em`.
- Itens: `formulario`, `cnpj`, `nome_cidade`, `site_instagram`, `portfolio`, `motivo`, `consentimento`, `categoria`.

## A · Approach

Itens e categoria gravados por `salvar_triagem1`. `requisitos_etapa` despacha para `requisitos_<etapa>(empresa)` se a função existir; `requisitos_triagem2` exige os oito itens, Receita `ativa` e categoria não "não aceita". Gatilho em `mensagens` com modelo `PEDIDO_INFO` grava `pedido_info_em`. "Encerrar com A5" registra a A5 e move para Recusada.

## S · Structure

- `supabase/migrations/20261025002200_req-005-triagem1.sql`
- `src/regras/triagem1.ts` + `triagem1.test.ts`
- `src/dados/tipos.ts`, `src/dados/api.ts`
- `src/telas/empresa/AbaTriagem1.tsx`, `src/telas/empresa/Ficha.tsx`
- `src/telas/funil/Funil.tsx` (destaque)
- `src/telas/config/Regras.tsx` (categorias)

## O · Operations

- **OP-0501 Banco.** Tabela, colunas, `salvar_triagem1`, despacho de `requisitos_etapa`, `requisitos_triagem2`, gatilho do pedido. Verifica: SQL.
- **OP-0502 Regra pura.** `itensTriagem1`, `pendenciasTriagem1`, `alertaCategoria`, `bloqueioCategoriaSemReceita`, `semRetorno(pedido, hoje)` (7 dias corridos). Verifica: testes.
- **OP-0503 Dados.** `listarCategorias`, `salvarCategoria`, `salvarTriagem1`, `encerrarComA5`.
- **OP-0504 Aba Triagem 1.** Lista com marcação, Receita (situação e porte) com link para a consulta pública — aparece antes de Categoria; Categoria com alerta e bloqueada até a situação na Receita ser registrada (DP-0503); botão "Pedir informação" (abre a aba Mensagens no modelo) e contagem de dias, "Concluir triagem 1" (move para Triagem 2), "Encerrar com A5". Edição só em Recebida e Triagem 1.
- **OP-0505 Funil.** Card em Triagem 1 com pedido há 7 dias ou mais: destaque e "Sem retorno há N dias".
- **OP-0506 Categorias.** Seção em "Regras e modelos": Direção edita a situação.

## N · Norms

- N-0501 Regras do `CLAUDE.md`. Triagem não julga se a parceria é boa.

## S · Safeguards

- S-0501 "Categoria não aceita"
- S-0502 "Precisa de Jurídico e Direção"
- S-0503 "Empresa inativa"
- S-0504 Saída para Triagem 2 com pendência: "Conclua a lista da Triagem 1: <itens>."
- S-0505 "Sem retorno há N dias"
- S-0506 "Consulte o CNPJ na Receita Federal antes de escolher a categoria."

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-0501, OP-0504 | navegador |
| 2 | OP-0502, OP-0504 | teste + navegador |
| 3 | OP-0502, OP-0504 | teste |
| 4 | OP-0502, OP-0505 | teste + navegador (data ajustada no banco) |
| 5 | OP-0501, OP-0504 | navegador |
| 6 | OP-0502, OP-0504 | teste + navegador |
