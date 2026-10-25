# Análise — REQ-003 — Entrada manual e indicação
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-003-entrada-manual-e-indicacao.md`

## Resumo

Cadastro manual pela Isabela ou Gerente, com a mesma ficha, origem obrigatória e conferência de CNPJ na base; o envio pelo site passa a avisar a Gerente quando o CNPJ é de parceira ativa.

## Estado atual

- `empresas.razao_social` é obrigatória e `origem` aceita as sete origens (`20261025000400_req-004-funil.sql`) [m].
- `enviar_ficha` já não duplica CNPJ existente: registra a ficha e avisa a 1ª pessoa (`20261025002000_req-002-formulario.sql`) [m].
- `CampoEmpresa` e `blocosFicha` prontos para reaproveitar (`src/componentes/CampoEmpresa.tsx`, `src/dados/campos.ts`) [m].

## Estado desejado

Botão "Nova empresa"; ao digitar o CNPJ, aviso de parceira ativa, conversa anterior ou nenhuma; parceira ativa não vira empresa nova; indicação exige quem indicou e gera lembrete de dar retorno.

## Conceitos e domínio

- Entrada manual exige só CNPJ, marca, contato, segmento e origem (regra 5): razão social deixa de ser obrigatória no banco [d].
- "Parceira ativa" = etapa `ativa` ou `renovacao` [i]; "conversa anterior" = qualquer outra etapa [d].
- Lembrete de retorno a quem indicou: aviso à 1ª pessoa (DP-0301) [d].

## Delta

Banco: `razao_social` opcional, regra "indicação exige nome", CNPJ validado no banco, `conferir_cnpj(cnpj)`, `enviar_ficha` com aviso ao responsável da parceira ativa, gatilho de lembrete de indicação. Front: `/empresas/nova`, aviso de CNPJ, botão na lista.

## Riscos

- `conferir_cnpj` revela se o CNPJ existe: só para usuários autenticados com papel de cadastro [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Indicação sem nome | Sim | — |
| 2 Conversa anterior | Sim | — |
| 3 Parceira ativa pelo site | Sim | — |
| 4 Cadastro em Recebida | Sim | — |

## Direção recomendada

Mesma tabela, mesma ficha; conferência por função de leitura; travas também no banco.

## Decisões pendentes

DP-0301 pela recomendação (à mão, com lembrete).

## Prontidão para REASONS

Pronto.
