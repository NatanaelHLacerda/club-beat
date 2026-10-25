# Análise — REQ-010 — Contrato e assinatura
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-010-contrato-e-assinatura.md`

## Resumo

Na etapa "Em contrato", a Gerente monta o pacote para o Jurídico (com o CPF de quem assina, guardado à parte), o Jurídico confere a lista do cap. 12 e marca "pronto para assinar", e a Gerente que finaliza registra a assinatura com o contrato anexado: a empresa vira "Ativa", nasce a parceria, as datas são confirmadas e Financeiro e Operações são avisados.

## Estado atual

- `registrar_aceite` e a decisão da Direção levam a "Em contrato" (REQ-008, REQ-009) [m].
- `parcerias` mínima existe para o conflito de exclusividade (REQ-006) [m].
- `confirmar_datas_da_empresa` pronta (REQ-012) [m].
- Jurídico lê empresas a partir de "Em contrato" (REQ-004) [m]. `anexos` aceita `minuta` e `contrato` [m].

## Estado desejado

Aba "Contrato" na ficha; tela do Jurídico com os contratos em andamento e prazo.

## Conceitos e domínio

- **Pacote** para o Jurídico: proposta aceita, ficha, razão social, CNPJ, endereço, nome e CPF de quem assina, e-mail da assinatura [d].
- **CPF** só no pacote e nunca em listas [d: CLAUDE.md]: tabela separada, legível só por Jurídico, Gerente e Direção, e mostrado mascarado fora da aba [i].
- **Lista de conferência** (17 itens do cap. 12) [d].
- **Prazos**: Jurídico 5 dias úteis mais ajustes; assinatura 2 dias úteis [d]. Os avisos de prazo são do REQ-014 [i].
- **Diferença entre minuta e proposta** volta à Gerente [d].
- **Ativar** exige contrato assinado anexado, início e fim, e as duas testemunhas [d].
- DP-1001 (quem é o Jurídico) e DP-1002 (minuta-modelo) dependem do Club; o CRM trata o papel "Jurídico" [d].

## Delta

Banco: `pacotes_contrato`, coluna `contrato` (jsonb), colunas da parceria (padrão, tipo, valor, troca, contrapartidas, promessa de revisão, responsável), `cpf_valido`, `enviar_ao_juridico`, `conferir_contrato`, `registrar_assinatura`, `requisitos_contrato`. Front: aba e tela do Jurídico.

## Riscos

- Gerar a parceria na assinatura antecipa colunas que o REQ-011 usa: são as do registro do cap. 11 [d].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Pacote sem CPF | Sim | — |
| 2 Exclusividade em branco | Sim | — |
| 3 Assinatura ativa e confirma datas | Sim | — |
| 4 Financeiro e Operações avisados | Sim | — |

## Direção recomendada

Fluxo em três funções (pacote, conferência, assinatura), cada uma só para o papel certo, com o CPF fora da tabela de empresas.

## Decisões pendentes

DP-1001 a DP-1003 continuam com o Club; nenhuma bloqueia o fluxo.

## Prontidão para REASONS

Pronto.
