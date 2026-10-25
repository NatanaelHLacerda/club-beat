# REASONS — REQ-011 — Parcerias ativas e acompanhamento
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-011-parcerias-ativas.md`
**Análise:** `spdd/analysis/REQ-011-parcerias-ativas.md`

## R · Requirements

Saber o que já foi entregue, quando foi o último relatório e o que os membros acharam. Fora: relatório automático em PDF.

## E · Entities

- `entregas` (`parceria_id`, `item` do cardápio, `data`, `descricao`, `privacidade_ok`, `nota_membros` 1–5, `autor_id`, `criado_em`).
- `materiais` (`parceria_id`, `descricao`, `situacao`: `aguardando`, `aprovado`, `recusado`, `motivo`, `decidido_por`, `decidido_em`).
- `relatorios` (`parceria_id`, `tipo`: `relatorio`, `balanco`, `referencia` (data do período), `resumo`, `enviado_em`, `autor_id`).
- `parcerias.medidas_informadas_em`; `anexos.entrega_id`.

## A · Approach

Entregas, materiais e relatórios gravados por inserção direta com RLS (quem mantém parcerias e Operações). Restrição no banco: ativação, evento ou aula sem privacidade não entra. Gatilho em `parcerias` impede a 9ª marca nas telas. A tela calcula com `src/regras/acompanhamento.ts`: contratado × feito, próximo relatório, atrasado, limite do mês.

## S · Structure

- `supabase/migrations/20261025002900_req-011-parcerias.sql`
- `src/regras/acompanhamento.ts` + `acompanhamento.test.ts`
- `src/dados/tipos.ts`, `src/dados/api.ts`, `src/lib/permissoes.ts`
- `src/telas/parcerias/Parcerias.tsx`, `src/telas/empresa/AbaParceria.tsx`, `src/telas/empresa/Ficha.tsx`, `src/App.tsx`

## O · Operations

- **OP-1101 Banco.** Tabelas, colunas, RLS, restrição de privacidade, gatilho das telas, `informar_medidas`, `decidir_material`. Verifica: SQL dos critérios 3 e da trava das telas.
- **OP-1102 Regra pura.** `contratadoFeito`, `proximoRelatorio(padrão, início, relatórios, hoje)`, `relatorioAtrasado`, `proximoBalanco`, `avisoLimiteMes`. Verifica: testes dos critérios 1, 2 e 4.
- **OP-1103 Dados.** `listarParcerias`, `obterParceria`, `listarEntregas`, `registrarEntrega`, `listarMateriais`, `registrarMaterial`, `decidirMaterial`, `listarRelatorios`, `registrarRelatorio`, `informarMedidas`, `entregasDoMes`.
- **OP-1104 Lista.** Marca, padrão, fim, contratado × feito, próximo relatório (atrasado destacado), balanço, marcas nas telas (N de 8).
- **OP-1105 Aba Parceria.** Registro (cap. 11), entregas com formulário (privacidade obrigatória em ativação, nota dos membros), materiais com aprovar/recusar, relatórios e balanços.

## N · Norms

- N-1101 Regras do `CLAUDE.md`. Nenhum dado de membro: só a nota agregada.

## S · Safeguards

- S-1101 "Confirme que a equipe do parceiro foi orientada sobre privacidade."
- S-1102 "As telas já têm 8 marcas ao mesmo tempo."
- S-1103 "Este mês já tem outro tipo de ação." / "Este mês já tem 4 dias de ação." (aviso)
- S-1104 "relatório atrasado"

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-1102, OP-1104 | teste + navegador |
| 2 | OP-1102, OP-1104 | teste |
| 3 | OP-1101, OP-1105 | SQL + navegador |
| 4 | OP-1102, OP-1105 | teste + navegador |
