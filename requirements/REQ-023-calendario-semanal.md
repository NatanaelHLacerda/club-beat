# REQ-023 — Calendário em visão de semana e de mês
**Status:** RASCUNHO
**Origem:** conversa de 2026-10-25 (kit: calendário com dias da semana no topo, horários na lateral e blocos de tarefa)

## Contexto

O calendário (REQ-012) mostra o ano em cartões e o mês em tabela. O kit usa uma grade de semana com horários e blocos coloridos.

## Problema

A tabela não mostra a semana de um jeito visual: é difícil ver horários e o que está livre.

## Objetivo

Visões "Semana" e "Mês" em grade, com blocos por data (tipo A, B, C, situação e empresa), mantendo a visão de ano e todas as regras de reserva.

## Atores

Direção, 1ª pessoa, Gerentes; leitura para os demais.

## Regras de negócio

1. Semana: colunas por dia (dom a sáb) com o dia de hoje destacado; linhas por horário; blocos na hora da aula com aula, tipo e empresa.
2. Mês: grade de 7 colunas com até 3 blocos por dia e "+N".
3. Cor do bloco pela situação: Livre (contorno), Reservada (Areia com borda dourada), Confirmada (Oceano com texto claro); tipo A marcado com um selo.
4. Clicar num bloco abre o painel lateral com os mesmos dados e ações de hoje (reservar, liberar, trocar).
5. Navegar entre semanas e meses; atalho "Hoje".

## Escopo

### Incluído
- Visões Semana e Mês, painel lateral do bloco.

### Fora do escopo
- Mudanças nas regras de reserva (REQ-012).

## Critérios de aceite

1. Dado a semana atual, então o dia de hoje aparece destacado e os sábados tipo A mostram o selo "A".
2. Dado uma data reservada pela Fonte Clara, então o bloco mostra "Fonte Clara" com borda dourada e "até dd/mm".
3. Dado um clique num bloco livre e a escolha de uma empresa Prata durante a janela de Master e Ouro, então a mesma mensagem de hoje aparece no painel.
4. Dado a tela de 375 px, então a visão Semana mostra um dia por vez com setas.

## Restrições

Sem biblioteca de calendário nova.

## Dependências

REQ-018, REQ-019, REQ-012.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-2301` | Visão padrão ao abrir | Semana atual |
