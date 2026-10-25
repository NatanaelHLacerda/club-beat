# REASONS — REQ-010 — Contrato e assinatura
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-010-contrato-e-assinatura.md`
**Análise:** `spdd/analysis/REQ-010-contrato-e-assinatura.md`

## R · Requirements

O que foi aceito vira contrato conferido e assinado, e a parceria só fica ativa com o contrato anexado. Fora: redação automática da minuta, assinatura digital integrada.

## E · Entities

- `pacotes_contrato` (`empresa_id`, `endereco`, `signatario_nome`, `signatario_cpf`, `email_assinatura`, `enviado_em`, `enviado_por`).
- `empresas.contrato` (jsonb): `enviado_juridico_em`, `prazo_juridico`, `minuta_tipo`, `conferencia` (17 itens), `divergencia`, `pronto_em`, `pronto_por`, `prazo_assinatura`, `assinado_em`.
- `parcerias` + `padrao`, `tipo_parceria`, `valor_mensal_centavos`, `troca`, `contrapartidas` (jsonb), `promessa_revisao`, `responsavel_id`.

## A · Approach

`enviar_ao_juridico` (Gerente) grava o pacote e o prazo de 5 dias úteis e avisa o Jurídico. `conferir_contrato` (Jurídico) grava tipo de minuta, lista e divergência; "pronto" exige os 17 itens e uma minuta anexada; divergência avisa a Gerente. `registrar_assinatura` (Gerente) exige pronto, contrato anexado, testemunhas e datas válidas; cria a parceria (exclusividade da proposta, se aprovada pela Direção), confirma as datas, move para Ativa e avisa Financeiro e Operações com as entregas e datas.

## S · Structure

- `supabase/migrations/20261025002800_req-010-contrato.sql`
- `src/regras/contrato.ts` + `contrato.test.ts`
- `src/dados/tipos.ts`, `src/dados/api.ts`
- `src/telas/empresa/AbaContrato.tsx`, `src/telas/empresa/Ficha.tsx`
- `src/telas/juridico/Juridico.tsx`, `src/componentes/Casca.tsx`, `src/App.tsx`, `src/lib/permissoes.ts`

## O · Operations

- **OP-1001 Banco.** Tabela, colunas, funções, `requisitos_contrato` (aceite registrado). Verifica: SQL dos critérios.
- **OP-1002 Regra pura.** `cpfValido`, `mascararCpf`, `itensConferencia`, `pendenciasConferencia`, `pendenciasPacote`, `validarAssinatura`. Verifica: testes.
- **OP-1003 Dados.** `obterPacote`, `enviarAoJuridico`, `conferirContrato`, `registrarAssinatura`, `listarParaJuridico`.
- **OP-1004 Aba Contrato.** Pacote (Gerente), conferência (Jurídico), minuta e contrato anexados, assinatura (Gerente). Situação e prazos sempre visíveis.
- **OP-1005 Tela Jurídico.** Contratos em andamento com prazo.

## N · Norms

- N-1001 Regras do `CLAUDE.md`. CPF mostrado só na aba Contrato para Jurídico e Gerente; nas demais telas, nunca.

## S · Safeguards

- S-1001 "Informe o CPF de quem assina." / "CPF inválido."
- S-1002 "Confira todos os itens da lista antes de marcar pronto para assinar."
- S-1003 "Anexe a minuta antes de marcar pronto." / "Anexe o contrato assinado."
- S-1004 "Marque a assinatura das duas testemunhas."
- S-1005 "O contrato ainda não está pronto para assinar."

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-1001, OP-1002, OP-1004 | teste + navegador |
| 2 | OP-1001, OP-1002 | teste + SQL |
| 3 | OP-1001, OP-1004 | navegador + SQL (datas) |
| 4 | OP-1001 | SQL (avisos) |
