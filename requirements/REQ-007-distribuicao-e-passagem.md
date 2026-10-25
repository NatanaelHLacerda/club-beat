# REQ-007 — Distribuição entre Gerentes e passagem de bastão
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (cenário "Revezamento de Gerentes"; documento-base cap. 3, passo 4 e anexo C)

## Contexto

Uma Gerente conduz (contato, reunião, proposta) e a outra finaliza (contrato e assinatura). Com mais volume ou na ausência de uma, a outra assume tudo.

## Problema

A divisão em duas pessoas pode perder o que foi dito na reunião, e escolher quem conduz caso a caso gera atrito.

## Objetivo

O CRM indica a Gerente que conduz por revezamento e exige a ficha de passagem antes de trocar de mãos.

## Atores

Isabela, Fernanda, Marcela.

## Regras de negócio

1. Revezamento por ordem de chegada à etapa "Triagem 2 concluída": uma empresa para cada Gerente, alternando.
2. A Isabela pode trocar a indicação por disponibilidade, com motivo.
3. Gerente marcada como indisponível sai do revezamento até voltar.
4. Ordem de atendimento: Ouro e candidatas a Master aparecem primeiro na fila da Gerente; Bronze vem depois, sem ficar esquecida.
5. Ao passar à Gerente: mensagem A2 para a empresa (sem valor nem promessa) e aviso à Gerente com ficha, classificação, estudo e portfólio.
6. **Ficha de passagem** obrigatória para mudar o "Gerente 2": o que a empresa busca, o que o Club apresentou, o que pediu a mais, o que se prometeu rever, datas de interesse, se precisa da Direção, prazo combinado e responsável final.
7. Uma Gerente pode ser Gerente 1 e 2 do mesmo caso (sem ficha de passagem).

## Escopo

### Incluído
- Campos Gerente 1, Gerente 2 e responsável final.
- Revezamento automático e troca manual.
- Ficha de passagem na empresa.
- Fila de cada Gerente ordenada por padrão.

### Fora do escopo
- Limite de parcerias por Gerente (DP-0701).

## Critérios de aceite

1. Dado que a última empresa foi para Fernanda, quando a próxima conclui a Triagem 2, então Marcela é indicada.
2. Dado Marcela marcada como indisponível, então as próximas empresas vão para Fernanda.
3. Dado um caso sem ficha de passagem, quando alguém define Gerente 2 diferente do Gerente 1, então o CRM recusa e abre a ficha.
4. Dado a passagem concluída, então a empresa recebe A2 com o nome da Gerente e a Gerente recebe aviso.

## Restrições

—

## Dependências

REQ-006, REQ-015.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-0701` | Limite de parcerias ativas por Gerente | Direção define; acima do limite, empresa entra em fila com aviso |
