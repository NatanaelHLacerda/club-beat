# REQ-014 — Prazos e alertas
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (cenário "Cobrança de prazos"; documento-base "Resumo dos prazos" e cap. 9 e 11)

## Contexto

Cada passo do funil tem prazo. Hoje quem cobra é a memória das pessoas.

## Problema

Empresas esfriam sem resposta e casos ficam parados na Direção sem ninguém perceber.

## Objetivo

O CRM conta os prazos de cada etapa em dias úteis, destaca os atrasados e escala para quem precisa saber.

## Atores

Isabela, Gerentes, Direção.

## Regras de negócio

1. Prazos: Triagem 1 até 1 dia útil; Triagem 2 até 2; passagem no mesmo dia; contato da Gerente até 2; reunião até 10 dias após o contato; proposta até 2; resposta da empresa 7 dias; Jurídico 5 + ajustes; Direção 3; assinatura 2; registro 1.
2. Gerente sem retorno à empresa em 2 dias úteis: aviso à outra Gerente. Persistindo por mais N dias úteis, aviso à Direção.
3. Empresa na mesma etapa por mais de N dias aparece como "parada" para a Isabela.
4. Dias úteis desconsideram sábados, domingos e feriados cadastrados.
5. Alertas aparecem no CRM (sino e destaque no card) e por e-mail.

## Escopo

### Incluído
- Contagem de prazo por etapa e destaque visual (no prazo, vence hoje, atrasado).
- Escalonamento entre Gerentes e para a Direção.
- Cadastro de feriados.
- Central de avisos do usuário.

### Fora do escopo
- Avisos por WhatsApp.

## Critérios de aceite

1. Dado uma empresa entrando em Triagem 1 numa sexta, então o prazo vence na segunda seguinte.
2. Dado um caso da Fernanda sem contato com a empresa há 2 dias úteis, então Marcela recebe aviso.
3. Dado um caso em "Com a Direção" há 3 dias úteis, então a Direção recebe novo aviso.
4. Dado um card parado além do limite, então ele aparece na lista "Paradas" da Isabela.

## Restrições

—

## Dependências

REQ-004.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-1401` | N dias úteis até escalar para a Direção | 3 dias úteis |
| `DP-1402` | N dias para "empresa parada" | 5 dias úteis |
