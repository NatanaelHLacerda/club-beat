# REQ-024 — Listas de acompanhamento no novo visual
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprovo todas. Siga do inicio ao fim da implementação do SPDD"*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (kit: "Manage Project", "Task Overview", tabelas com status e ações)

## Contexto

Parcerias ativas, Renovações, Prazos, Minha fila, Direção, Jurídico, Operações e Avisos são tabelas e listas simples, cada uma com seu jeito.

## Problema

As listas de trabalho do dia a dia não seguem o mesmo padrão nem destacam o que é urgente.

## Objetivo

Todas as listas com o mesmo cabeçalho (título, números de resumo em cartões, filtros), a mesma tabela do REQ-018 e destaque visual para atrasos.

## Atores

Cada papel na sua lista.

## Regras de negócio

1. Cabeçalho com até quatro cartões de número da lista (ex.: Prazos: atrasados, vencem hoje, no prazo).
2. Tabela padrão com avatar da empresa, pills de situação, data com ícone de calendário e ações por ícone.
3. Atrasado sempre com a pill vermelha e a linha marcada à esquerda.
4. Avisos em lista no estilo "Task overview" do kit: ícone pelo tipo, texto, empresa e data; "Marcar todos como lidos".
5. Parcerias ativas: barra de progresso de entregas (feito/contratado) por linha.

## Escopo

### Incluído
- Telas Parcerias ativas, Renovações, Prazos, Minha fila, Direção, Jurídico, Operações, Avisos.

### Fora do escopo
- Novas regras nessas telas.

## Critérios de aceite

1. Dado Prazos com 2 atrasados, então o cartão "Atrasados" mostra 2 e as duas linhas aparecem marcadas.
2. Dado Avisos com 4 não lidos, quando clica "Marcar todos como lidos", então o contador do sino vai a 0.
3. Dado a Sabor Leve com 3 de 8 ativações, então a barra de entregas mostra 3/8.
4. Todas as listas usam o mesmo componente de tabela (verificável na página de referência do REQ-018).

## Restrições

Sem dependência nova.

## Dependências

REQ-018, REQ-019.

## Decisões pendentes

—
