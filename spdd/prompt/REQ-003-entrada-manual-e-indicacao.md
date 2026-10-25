# REASONS — REQ-003 — Entrada manual e indicação
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-003-entrada-manual-e-indicacao.md`
**Análise:** `spdd/analysis/REQ-003-entrada-manual-e-indicacao.md`

## R · Requirements

Toda empresa entra pela mesma ficha, com origem, sem duplicar. Fora: leitura automática de e-mail e WhatsApp.

## E · Entities

- `empresas`: `razao_social` opcional; restrição "origem de indicação exige `indicado_por`"; restrição `cnpj_valido(cnpj)`.
- Resultado de `conferir_cnpj`: `id`, `marca`, `etapa`, `etapa_desde`, `motivo_saida`, `situacao` (`ativa`, `anterior`).

## A · Approach

Inserção direta (a RLS do REQ-004 já limita a 1ª pessoa e Gerente, etapa Recebida). Antes de salvar, a tela consulta `conferir_cnpj`; parceira ativa bloqueia o cadastro e oferece abrir a ficha existente. Gatilho na criação com indicação gera o lembrete. `enviar_ficha` recriada: CNPJ de parceira ativa avisa o responsável (ou Gerente 1).

## S · Structure

- `supabase/migrations/20261025002100_req-003-entrada-manual.sql`
- `src/regras/entrada.ts` + `entrada.test.ts`
- `src/dados/api.ts`, `src/dados/tipos.ts`
- `src/telas/empresas/NovaEmpresa.tsx`, `src/telas/empresas/Empresas.tsx`, `src/App.tsx`

## O · Operations

- **OP-0301 Banco.** Alterações de `empresas`; `conferir_cnpj` (1ª pessoa, Gerente, Direção); gatilho `lembrete_indicacao`; `enviar_ficha` recriada com o aviso ao responsável. Verifica: SQL.
- **OP-0302 Regra pura.** `validarEntradaManual(dados)` (obrigatórios da regra 5, CNPJ, indicação com nome) e `textoConferencia(resultado)`. Verifica: testes.
- **OP-0303 Dados.** `conferirCnpj`, `cadastrarEmpresa` (devolve o id).
- **OP-0304 Tela.** `/empresas/nova`: CNPJ primeiro com conferência ao completar 14 dígitos; blocos da ficha; obrigatórios marcados; parceira ativa desabilita "Cadastrar" e mostra o link; ao salvar, abre a ficha.
- **OP-0305 Lista.** Botão "Nova empresa" para quem pode `editar_empresa`.

## N · Norms

- N-0301 Regras do `CLAUDE.md`; campos e opções de `src/dados/campos.ts`.

## S · Safeguards

- S-0301 "Informe quem indicou."
- S-0302 Conversa anterior: "Já conversou: <etapa> desde <mm/aaaa>" + motivo quando houver.
- S-0303 Parceira ativa: "Já é parceira ativa. Abra a ficha para tratar como renovação."
- S-0304 Nenhum CPF na entrada manual.

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-0301, OP-0302, OP-0304 | teste + navegador |
| 2 | OP-0301, OP-0304 | navegador com a Grão Nobre (Em espera) |
| 3 | OP-0301 | SQL: ficha anônima com CNPJ ativo |
| 4 | OP-0304 | navegador |
