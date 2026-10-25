# REASONS — REQ-006 — Segunda triagem: classificação e padrão
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-006-classificacao-e-padrao.md`
**Análise:** `spdd/analysis/REQ-006-classificacao-e-padrao.md`

## R · Requirements

Classificar porte, aderência e padrão com regra escrita, sem dar benefício de Ouro a quem investe como Prata. Fora: aprovação da Direção (REQ-009).

## E · Entities

- `empresas.classificacao` (jsonb): `industria`, `grupo`, `grupo_faixa`, `porte_faturamento`, `porte_funcionarios`, `provisorio`, `nota_porte`, `aderencia` (5 critérios: `sim`, `em_parte`, `nao`), `pontos` (5 critérios, 1 a 3), `faixa_investimento` (`bronze`, `prata`, `ouro`), `padrao_pontos`.
- `empresas`: `estudo` (texto), `candidata_master` (bool), `triagem2_concluida_em`.
- `parcerias` (mínima): `empresa_id`, `situacao` (`vigente`, `encerrada`), `inicio`, `fim`, `exclusividade_categoria`, `exclusividade_inicio`, `exclusividade_fim`, `nao_renovar`.

## A · Approach

A tela calcula tudo com `src/regras/classificacao.ts` e salva por `salvar_classificacao` (só em Triagem 2). `concluir_triagem2` confere: aderência sem reprovação, estudo preenchido, sem conflito, pontos completos; recalcula padrão por pontos e final (menor) no banco e grava `triagem2_concluida_em`. `conflito_categoria(categoria, empresa)` devolve parceiro e fim.

## S · Structure

- `supabase/migrations/20261025002300_req-006-classificacao.sql`
- `supabase/seed.sql` — parceira ativa de exemplo com exclusividade.
- `src/regras/classificacao.ts` + `classificacao.test.ts`
- `src/dados/tipos.ts`, `src/dados/api.ts`
- `src/telas/empresa/AbaClassificacao.tsx`, `src/telas/empresa/Ficha.tsx`

## O · Operations

- **OP-0601 Banco.** Tabela `parcerias` com RLS (leitura como a empresa; escrita só por funções), colunas novas, `padrao_por_pontos(int)`, `menor_padrao`, `conflito_categoria`, `salvar_classificacao`, `concluir_triagem2`. Verifica: SQL dos critérios 3, 5 e 6.
- **OP-0602 Regra pura.** `classificarPorte({faturamento, funcionarios, industria, receitaPorte, grupoFaixa})` → `{porte, nota, provisorio}`; `pontosSugeridos(porte, faixa, duracao)`; `padraoPorPontos(soma)`; `padraoFinal(pontos, faixa)`; `avaliarAderencia(respostas)` → `{reprovada, motivo}`. Verifica: testes dos critérios 1 a 4.
- **OP-0603 Dados.** `salvarClassificacao`, `concluirTriagem2`, `conferirConflito`.
- **OP-0604 Aba Classificação.** Blocos Porte, Aderência, Pontos, Padrão, Conflito, Estudo; resultados ao vivo; "Encerrar com A5" quando a aderência reprova; "Concluir triagem 2". Editável só em Triagem 2.

## N · Norms

- N-0601 Regras do `CLAUDE.md`; textos do cap. 6 e 7.

## S · Safeguards

- S-0601 Nota de divergência: "divergência: faturamento indica <porte>" (ou "funcionários indicam <porte>").
- S-0602 "limitado pelo investimento"
- S-0603 Conflito: "Conflito de exclusividade com <marca> até <dd/mm/aaaa>."
- S-0604 "Escreva o estudo da empresa para concluir."
- S-0605 Aderência: "Não combina com o membro: propor recusa com A5."
- S-0606 Master: "Candidata a Master: a Direção decide."

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-0602 | teste |
| 2 | OP-0602, OP-0604 | teste + navegador |
| 3 | OP-0602, OP-0601 | teste + SQL |
| 4 | OP-0602, OP-0604 | teste + navegador |
| 5 | OP-0601, OP-0604 | SQL + navegador |
| 6 | OP-0601, OP-0604 | SQL + navegador |
