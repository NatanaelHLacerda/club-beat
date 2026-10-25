# REQ-022 — Ficha da empresa no novo visual
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprovo todas. Siga do inicio ao fim da implementação do SPDD"*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (kit: página de detalhe com cartão de perfil, abas e painéis laterais)

## Contexto

A ficha tem muitas abas (até 13) e um painel lateral simples. No kit, o detalhe abre com um cartão de perfil (avatar, nome, contato) e blocos bem separados.

## Problema

Com tantas abas numa linha, é difícil saber onde está o que falta fazer.

## Objetivo

Ficha com cartão de perfil, linha do caminho (etapas já percorridas e a atual), abas agrupadas e um painel "Próximo passo" que diz o que fazer agora.

## Atores

Todos os papéis com acesso à empresa.

## Regras de negócio

1. Cartão de perfil: avatar por iniciais, marca, razão social, CNPJ, contato (nome, e-mail, WhatsApp com botão de copiar), padrão, porte, categoria.
2. Linha do caminho: Recebida → Triagens → Reunião → Proposta → (Direção) → Contrato → Ativa → Renovação, com a etapa atual em Oceano e as concluídas com marca.
3. Abas agrupadas em quatro: **Empresa** (Resumo, Anexos, Linha do tempo), **Triagem** (Triagem 1, Classificação, Gerentes), **Negócio** (Reunião e proposta, Direção, Contrato), **Parceria** (Parceria, Renovação); Mensagens fica no painel lateral.
4. Painel "Próximo passo": texto do que falta agora, com o prazo (REQ-014) e um botão que abre a aba certa.
5. A aba aberta segue a etapa, como hoje.

## Escopo

### Incluído
- Reorganização visual da ficha e de suas abas com as peças do REQ-018.

### Fora do escopo
- Mudança nas regras de cada aba.

## Critérios de aceite

1. Dado uma empresa em Triagem 2, então a linha do caminho mostra Recebida e Triagem 1 concluídas e Triagem 2 atual.
2. Dado a Rede Verde em Em proposta sem envio, então "Próximo passo" diz "Enviar a proposta" com o prazo e abre "Reunião e proposta".
3. Dado o botão de copiar o WhatsApp, quando clicado, então o número vai para a área de transferência e aparece "Copiado".
4. Dado o papel Jurídico, então só os grupos de abas que ele pode ver aparecem.

## Restrições

Sem dependência nova.

## Dependências

REQ-018, REQ-019, REQ-014.

## Decisões pendentes

—
