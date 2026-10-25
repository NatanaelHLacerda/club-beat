# REQ-015 — Mensagens-modelo
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (documento-base anexo A)

## Contexto

O documento-base traz sete mensagens curtas e cordiais (A1 a A7) para cada momento do funil.

## Problema

Cada pessoa escreve do seu jeito, e às vezes promete o que não pode.

## Objetivo

As mensagens ficam no CRM, preenchidas com os dados da empresa, prontas para enviar por e-mail ou copiar para o WhatsApp.

## Atores

Isabela, Gerentes, Fernanda (edita modelos).

## Regras de negócio

1. Modelos: A1 confirmação automática; A2 aviso de que uma Gerente vai entrar em contato; A3 convite para reunião; A4 retorno com proposta; A5 recusa educada; A6 aviso interno de renovação; A7 convite de renovação.
2. Modelo extra: **Pedido de informação** (Triagem 1), com prazo de 7 dias.
3. Campos trocados automaticamente: [nome], [empresa], [Gerente], [data], [padrão].
4. A1 e A6 saem sozinhas; as demais são abertas pela pessoa, que pode ajustar antes de enviar.
5. Toda mensagem enviada fica na linha do tempo da empresa.
6. Mensagens à empresa antes da proposta não citam valores.

## Escopo

### Incluído
- Cadastro e edição dos modelos.
- Botões "Enviar por e-mail" e "Copiar para WhatsApp" na ficha.

### Fora do escopo
- Envio pela API do WhatsApp.

## Critérios de aceite

1. Dado a empresa "Rede Verde" e a Gerente Fernanda, quando a Isabela abre A2, então o texto vem com "Rede Verde" e "Fernanda" preenchidos.
2. Dado "Copiar para WhatsApp", então o texto vai para a área de transferência e a linha do tempo registra "A2 copiada".
3. Dado um modelo editado pela Fernanda, então as próximas mensagens usam o texto novo.

## Restrições

—

## Dependências

REQ-004.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-1501` | Texto do "Pedido de informação" (não está no anexo A) | Fernanda escreve; rascunho inicial pelo agente para revisão |
| `DP-1502` | O documento-base cita A3 no passo 4 e A2 no anexo para o mesmo aviso | Seguir o anexo A (A2) |
