# REASONS — REQ-008 — Reunião e proposta
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-008-reuniao-e-proposta.md`
**Análise:** `spdd/analysis/REQ-008-reuniao-e-proposta.md`

## R · Requirements

O que se combina com a empresa fica no CRM, e a proposta não promete o que a Gerente não pode prometer. Fora: PDF da proposta, agenda integrada.

## E · Entities

- `cardapio`: `padrao`, `item` (`telas`, `marca_site`, `ativacao_1d`, `ativacao_3d`, `ativacao_4d`, `redes`, `eventos`, `beneficio_colaboradores`, `exclusividade`, `marca_recepcao`, `relatorio`), `rotulo`, `descricao`, `maximo` (nulo = sem número), `ordem`.
- `empresas.reuniao` (jsonb): `quando`, `local`, `presencial`, `objetivo`, `sucesso`, `quem_decide`, `datas_interesse`, `pedidos_extra`, `notas`, `realizada`.
- `empresas.formato` (`continua`, `pontual`, `evento`, `aula_fechada`), `empresas.tipo_parceria` (`patrocinio`, `industria`, `servico`, `troca`).
- `empresas.proposta` (jsonb): `itens` [{`item`, `quantidade`}], `fora_do_cardapio`, `valor_mensal_centavos`, `troca`, `prazo_meses`, `inicio`, `exclusividade_categoria`, `nao_pode_perder`, `justificativa`, `promessa_revisao`, `enviada_em`, `prazo_resposta`, `aceite_em`, `direcao_aprovada_em`.
- `empresas.operacoes` (jsonb): `capacidade`, `equipe`, `espaco_horario`, `custo_centavos`, `observacao`, `confirmada_em`, `confirmada_por`.

## A · Approach

`salvar_reuniao` grava agenda e anotações; marcar a reunião é `mover_etapa('reuniao')`, que exige data e local. `salvar_proposta` aceita só itens do cardápio do padrão final, com quantidade até o máximo, e zera a confirmação de Operações quando a proposta muda. `motivos_direcao(empresa)` lista o que obriga a Direção. `enviar_proposta` exige Operações e, se houver motivo de Direção, aprovação registrada. `registrar_aceite` exige anexo de aceite e leva para "Em contrato", ou para "Com a Direção" se houver motivo sem aprovação.

## S · Structure

- `supabase/migrations/20261025002600_req-008-proposta.sql`
- `src/regras/proposta.ts` + `proposta.test.ts`
- `src/dados/tipos.ts`, `src/dados/api.ts`
- `src/telas/empresa/AbaProposta.tsx`, `src/telas/empresa/Ficha.tsx`
- `src/telas/operacoes/Operacoes.tsx`, `src/telas/config/Regras.tsx`, `src/componentes/Casca.tsx`, `src/App.tsx`
- `src/telas/funil/Funil.tsx` (prazo de resposta vencido)

## O · Operations

- **OP-0801 Banco.** Tabela e colunas, funções, recriação de `requisitos_reuniao`, `requisitos_proposta` (reunião realizada), `empresa_preve_acao` (proposta vazia ou com ativação/evento). Verifica: SQL dos critérios 1, 2, 4 e 5.
- **OP-0802 Regra pura.** `itensDoPadrao(cardapio, padrão)`, `validarItens`, `motivosDirecao(empresa, proposta, categoriaSensivel)`, `respostaVencida(prazo, hoje)`. Verifica: testes.
- **OP-0803 Dados.** `listarCardapio`, `salvarItemCardapio`, `salvarReuniao`, `salvarProposta`, `confirmarOperacoes`, `enviarProposta`, `registrarAceite`, `listarParaOperacoes`.
- **OP-0804 Aba Reunião e proposta.** Reunião (agenda, presencial, anotações, "Marcar reunião", "Reunião realizada"); Proposta (formato, tipo, itens do cardápio com máximo, fora do cardápio, valor, prazo, início, exclusividade, não pode perder, promessa de revisão); motivos de Direção; Operações (situação); Envio e prazo; Aceite com anexo; Sem acordo (Em espera, retomar em 6 meses). Atalhos para A3 e A4.
- **OP-0805 Operações.** Tela `/operacoes` com propostas aguardando confirmação e o formulário de confirmação.
- **OP-0806 Cardápio.** Seção em "Regras e modelos"; Direção edita descrição e máximo.

## N · Norms

- N-0801 Regras do `CLAUDE.md`. Valores "R$ …" até a Direção definir.

## S · Safeguards

- S-0801 "Acima do máximo do padrão: <item> até <n>."
- S-0802 "Operações precisa confirmar a viabilidade antes do envio."
- S-0803 "Esta proposta precisa da Direção antes de sair: <motivos>."
- S-0804 "Anexe o aceite por escrito (e-mail basta)."
- S-0805 "Informe a data e o local da reunião."
- S-0806 A proposta nunca promete público mínimo, vendas ou retorno: aviso fixo na aba.

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-0801, OP-0802, OP-0804 | teste + SQL + navegador |
| 2 | OP-0801, OP-0804 | SQL + navegador |
| 3 | OP-0802, OP-0804 | teste + navegador |
| 4 | OP-0801, OP-0804 | SQL + navegador |
| 5 | OP-0801, OP-0802 | SQL |
