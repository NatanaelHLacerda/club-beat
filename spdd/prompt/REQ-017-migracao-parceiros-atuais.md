# REASONS — REQ-017 — Migração dos parceiros atuais
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-017-migracao-parceiros-atuais.md`
**Análise:** `spdd/analysis/REQ-017-migracao-parceiros-atuais.md`

## R · Requirements

A base atual entra no CRM na etapa real de cada parceiro, para conflitos e renovações funcionarem desde o primeiro dia. Fora: leitura de contratos em PDF.

## E · Entities

Linha de importação: `cnpj`, `marca`, `razao_social`, `contato_nome`, `contato_email`, `contato_whatsapp`, `segmento`, `categoria`, `padrao`, `tipo`, `inicio`, `fim`, `valor_mensal`, `troca`, `contrapartidas` (`item:qtd;item:qtd`), `entregas_feitas` (`item:qtd;…`), `exclusividade_categoria`, `exclusividade_fim`, `responsavel_email`, `contrato_assinado` (`sim`/`não`).

## A · Approach

A tela lê o CSV (`;` ou `,`), valida cada linha com a regra pura e mostra a pré-visualização. `importar_parceiros(linhas)` repete as validações e, por linha, cria empresa + parceria (ou proposta aceita), na etapa certa, com histórico "Importado da base atual"; devolve `[{linha, ok, motivo, empresa_id}]`.

## S · Structure

- `supabase/migrations/20261025003300_req-017-migracao.sql`
- `src/regras/importacao.ts` + `importacao.test.ts`
- `src/dados/api.ts`
- `src/telas/config/Importar.tsx`, `src/componentes/Casca.tsx`, `src/App.tsx`

## O · Operations

- **OP-1701 Banco.** `importar_parceiros(linhas jsonb)` (1ª pessoa e Gerente), um bloco por linha. Verifica: SQL dos critérios 2, 3 e 4.
- **OP-1702 Regra pura.** `lerCsv(texto)`, `validarLinha(linha)`, `lerItens("telas:1;ativacao_1d:4")`, `lerValor("1.234,56")`. Verifica: testes (12 linhas, 2 sem CNPJ).
- **OP-1703 Dados.** `importarParceiros(linhas)`.
- **OP-1704 Tela.** Modelo de colunas para copiar, escolher arquivo, pré-visualização com erros, "Importar N linhas válidas", relatório; formulário para uma parceria.

## N · Norms

- N-1701 Regras do `CLAUDE.md`. Nenhum CPF na planilha.

## S · Safeguards

- S-1701 Linha sem CNPJ: "CNPJ obrigatório"; inválido: "CNPJ inválido"; já cadastrado: "Já existe no CRM".
- S-1702 Datas: "Início e fim em dd/mm/aaaa ou aaaa-mm-dd, fim depois do início".
- S-1703 Contrato assinado exige início e fim.

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-1702, OP-1704 | teste + navegador |
| 2 | OP-1701 | SQL |
| 3 | OP-1701 | SQL |
| 4 | OP-1701 | SQL (conflito_categoria) |
