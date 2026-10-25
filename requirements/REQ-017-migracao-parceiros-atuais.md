# REQ-017 — Migração dos parceiros atuais
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (documento-base "Começar pelos parceiros que já existem", cap. 11)

## Contexto

Antes de o fluxo valer para novas empresas, a base atual de parceiros precisa entrar no CRM na etapa em que realmente está.

## Problema

Sem a base atual, o CRM não detecta conflitos de exclusividade nem avisa renovações dos contratos que já existem.

## Objetivo

Cadastrar todos os parceiros atuais com contrato, datas, entregas, categoria, responsável e padrão.

## Atores

Gerentes, Isabela, Jurídico.

## Regras de negócio

1. Parceiro com contrato assinado e em dia entra direto em "Ativa".
2. Parceiro sem contrato entra em "Em contrato", para regularizar com a minuta do Jurídico.
3. Cada parceiro recebe padrão pela ficha de pontos, para a próxima renovação seguir o sistema.
4. Entregas já feitas são registradas como feitas, com data.
5. Contratos que vencem em menos de 90 dias entram direto em "Em renovação".
6. Importação por planilha (CSV) com os campos da aba "Parcerias ativas", além do cadastro manual.

## Escopo

### Incluído
- Importação por CSV com relatório de linhas aceitas e recusadas.
- Cadastro manual de parceria existente.

### Fora do escopo
- Leitura automática de contratos em PDF.

## Critérios de aceite

1. Dado um CSV com 12 parceiros, 2 sem CNPJ, então 10 são importados e o relatório lista as 2 linhas recusadas com o motivo.
2. Dado um parceiro sem contrato, então ele aparece em "Em contrato".
3. Dado um contrato que termina daqui a 45 dias, então ele aparece em "Em renovação".
4. Dado um parceiro importado com exclusividade em "beleza e estética", então a categoria passa a gerar alerta de conflito (REQ-006).

## Restrições

—

## Dependências

REQ-006, REQ-010, REQ-011.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-1701` | Quem faz o levantamento dos parceiros atuais e até quando? | Gerentes + Jurídico |
