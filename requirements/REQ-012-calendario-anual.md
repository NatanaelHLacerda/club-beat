# REQ-012 — Calendário anual de eventos
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (cenário D5 e D28; documento-base cap. 10)

## Contexto

O Club tem um calendário anual com datas A (alta procura), B (média) e C (livres). As datas mais disputadas seguem a prioridade Master, Ouro, Prata e Bronze.

## Problema

Sem calendário compartilhado, a mesma data pode ser prometida a dois parceiros.

## Objetivo

Um calendário onde cada data tem tipo, aula, horário e média de alunos, com reserva provisória, confirmação na assinatura e regras de prioridade.

## Atores

Direção (publica), Isabela (mantém), Gerentes (reservam).

## Regras de negócio

1. Cada data: dia, tipo A/B/C, aula e horário, média de alunos, tema, situação (Livre, Reservada, Confirmada) e empresa.
2. Tipo A: manhãs e sábados. Vésperas de feriado ficam para Bronze e Prata.
3. Janela de escolha: Master e Ouro primeiro, depois Prata, depois Bronze. Datas C por ordem de chegada.
4. Reserva provisória dura 7 dias; sem assinatura, volta a Livre.
5. Só reserva data a empresa cuja proposta prevê aquela ação.
6. Mudança de data só com pedido por escrito, antecedência mínima e nova data livre.
7. Limites: um tipo de ação por mês, 4 dias de ação por mês, até 8 marcas nas telas ao mesmo tempo.

## Escopo

### Incluído
- Visão anual e mensal com cores por tipo e situação.
- Cadastro do calendário do ano pela Direção.
- Reserva pela proposta, confirmação pela assinatura, expiração automática.

### Fora do escopo
- Integração com a grade de aulas do Club.

## Critérios de aceite

1. Dado um sábado tipo A dentro da janela de Master e Ouro, quando uma Gerente tenta reservar para uma empresa Prata, então o CRM recusa e mostra quando abre a janela Prata.
2. Dado uma reserva feita em 01/11 sem assinatura, quando chega 08/11, então a data volta a "Livre" e a Gerente é avisada.
3. Dado uma data "Confirmada", quando outra Gerente tenta reservar, então o CRM recusa.
4. Dado uma véspera de feriado, então só empresas Bronze e Prata conseguem reservar.

## Restrições

—

## Dependências

REQ-001.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-1201` | Datas A, B e C do ano e data de publicação | Direção |
| `DP-1202` | Duração de cada janela de escolha | Direção; sugestão 15 dias por janela |
| `DP-1203` | Antecedência mínima para mudar data | Direção; sugestão 30 dias |
