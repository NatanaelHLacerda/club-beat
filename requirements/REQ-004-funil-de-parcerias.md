# REQ-004 — Funil de parcerias
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (cenário "O funil no CRM"; documento-base cap. 2, 4 e 11)

## Contexto

O documento-base organiza as parcerias como um funil com status fixos, que a Isabela hoje atualiza numa planilha.

## Problema

Sem um funil visível, não se sabe onde cada empresa está, quem cuida dela nem por que saiu.

## Objetivo

Ver todas as empresas por etapa, abrir a ficha de cada uma com o histórico e mover entre etapas respeitando as regras.

## Atores

Isabela, Gerentes, Direção (leitura).

## Regras de negócio

1. Etapas: **Recebida → Triagem 1 → Triagem 2 → Reunião marcada → Em proposta → Com a Direção → Em contrato → Ativa → Em renovação → Encerrada**.
2. Saídas: **Em espera** e **Recusada**, a partir de qualquer etapa antes de Ativa.
3. Em espera e Recusada exigem motivo; Em espera exige também data para retomar.
4. "Com a Direção" só é usada quando a regra do REQ-009 pede.
5. "Ativa" só acontece pela assinatura (REQ-010), nunca arrastando o card.
6. Cada etapa só aceita o card com os campos dela preenchidos (definidos nos REQs de cada etapa).
7. Toda mudança de etapa fica no histórico com autor e data.
8. Cada empresa tem sempre um responsável final, mesmo com duas Gerentes.

## Escopo

### Incluído
- Funil em colunas, com contagem por etapa e filtros (padrão, porte, segmento, Gerente, origem).
- Lista de empresas com busca por nome e CNPJ.
- Ficha da empresa: dados do formulário, anexos, classificação, linha do tempo, anotações.
- Mudança de etapa por seleção na ficha (funciona sem arrastar e no celular).

### Fora do escopo
- Etapas configuráveis pela tela.

## Critérios de aceite

1. Dado uma empresa recebida pelo site, então ela aparece na coluna "Recebida" e no topo da lista.
2. Dado um card em "Triagem 2", quando a Isabela move para "Recusada" sem motivo, então o CRM recusa.
3. Dado um card em "Em contrato", quando alguém tenta arrastá-lo para "Ativa", então o CRM indica que é preciso registrar a assinatura.
4. Dado o filtro "Padrão = Prata", então as contagens das colunas mostram só empresas Prata.
5. Dado uma mudança de etapa, então a linha do tempo mostra etapa anterior, nova etapa, autor e data.

## Restrições

—

## Dependências

REQ-001.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-0401` | Card pode voltar de etapa? | Sim, com registro no histórico |
| `DP-0402` | Empresa "Em espera" volta sozinha na data de retomar? | Não; gera lembrete para a Isabela |
