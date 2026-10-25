# Análise — REQ-017 — Migração dos parceiros atuais
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-017-migracao-parceiros-atuais.md`

## Resumo

Importar a base atual de parceiros por CSV (colunas da aba "Parcerias ativas" do cap. 11) ou cadastrar um a um, colocando cada parceiro na etapa certa: Ativa, Em renovação (menos de 90 dias) ou Em contrato (sem contrato). Relatório mostra linhas aceitas e recusadas com motivo.

## Estado atual

- `parcerias` completa (REQ-010, REQ-011, REQ-013), `entregas` com privacidade obrigatória nas ações [m].
- Gatilho de 8 marcas nas telas e conflito de exclusividade por categoria (REQ-006, REQ-011) [m].
- A rotina de renovação trata quem está a menos de 90 dias (REQ-013) [m].

## Estado desejado

Tela "Importar parceiros" em Configuração, com modelo de colunas, pré-visualização com erros por linha, importação e relatório; formulário de uma parceria.

## Conceitos e domínio

- Contrato assinado e em dia → Ativa, com parceria vigente [d].
- Sem contrato → Em contrato, para regularizar com o Jurídico; contrapartidas e vigência ficam na proposta (aceite registrado) [d].
- Fim em menos de 90 dias → Em renovação [d].
- Padrão pela ficha de pontos: informado na planilha pela Isabela; vazio fica para classificar [d].
- Entregas já feitas entram como feitas (data = início, marcadas como importadas) [i].
- Exclusividade importada passa a gerar conflito [d].

## Delta

Banco: `importar_parceiros(linhas)` com uma transação por linha (falha de uma não derruba as outras) e relatório. Regras puras: leitura do CSV, validação por linha. Front: tela de importação e formulário manual.

## Riscos

- Arquivo vindo do Excel em português usa ";" e vírgula decimal: o leitor aceita os dois separadores e "1.234,56" [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 12 linhas, 2 sem CNPJ | Sim | — |
| 2 Sem contrato → Em contrato | Sim | — |
| 3 Fim em 45 dias → Em renovação | Sim | — |
| 4 Exclusividade importada gera conflito | Sim | — |

## Direção recomendada

Validação na tela (pré-visualização) e de novo no banco, linha a linha, com o mesmo relatório.

## Decisões pendentes

DP-1701 (quem levanta e até quando) fica com Gerentes e Jurídico; não bloqueia a ferramenta.

## Prontidão para REASONS

Pronto.
