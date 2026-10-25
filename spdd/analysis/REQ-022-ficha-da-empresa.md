# Análise — REQ-022 — Ficha da empresa no novo visual
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-022-ficha-da-empresa.md`

## Resumo

A ficha ganha cartão de perfil, linha do caminho, abas em quatro grupos (por papel) e o painel "Próximo passo"; Mensagens sai das abas e vai para o painel lateral.

## Estado atual

- `src/telas/empresa/Ficha.tsx:37-50`: 12 abas numa linha, aba inicial pela etapa, painel lateral com Situação e Mudar etapa [m].
- `prazos_abertos()` dá descrição e prazo da etapa atual (REQ-014) [m].
- Abas abrem outras por `abrirAba(id, modelo)` (A3, A4, A7, Pedido de informação) [m].

## Estado desejado

Cabeçalho limpo, caminho visível, dois níveis de navegação (grupo e aba), "Próximo passo" com botão para a aba certa, mensagens num painel lateral aberto pelo botão ou pelos atalhos.

## Conceitos e domínio

- Caminho: Recebida → Triagem 1 → Triagem 2 → Reunião → Proposta → (Direção, se passou) → Contrato → Ativa → Renovação [d].
- Grupos por papel: Jurídico vê Empresa, Negócio (só Contrato) e Parceria; Financeiro e Operações veem Empresa, Negócio (Proposta) e Parceria [i: leitura por etapa do REQ-004].

## Delta

`src/regras/caminho.ts` (passos, próximo passo, aba do prazo) com testes; Ficha reescrita; `PerfilEmpresa`; Mensagens em `PainelLateral`.

## Riscos

- Atalhos que abriam a aba Mensagens passam a abrir o painel: o mesmo `abrirAba('mensagens', modelo)` [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Caminho em Triagem 2 | Sim | — |
| 2 Próximo passo da Rede Verde | Sim | — |
| 3 Copiar WhatsApp | Sim | — |
| 4 Jurídico | Sim | — |

## Direção recomendada

Configuração de abas com grupo e papéis; regras do caminho em função pura.

## Decisões pendentes

Nenhuma.

## Prontidão para REASONS

Pronto.
