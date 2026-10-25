# REQ-027 — Cabeçalho de cartão e barra de ações da tela
**Status:** APROVADO — Natanael, 2026-10-25 (*"aprovo e siga até o fim."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (kit "CRM Dashboard UI Kit" lido pelo servidor do Figma, arquivo jXAbzyaCTYIqPUbejivp1C)

## Contexto
No kit, cada cartão abre com uma faixa tingida e arredondada (título de 18 px, filete à esquerda e um controle à direita, como "Last Month" ou "View All"). No topo do conteúdo, uma única linha junta o nome da seção à esquerda e busca, filtro, troca de visão e botão principal à direita.

## Problema
No CRM o título do cartão flutua sem faixa, e em Empresas as ações ficam em duas linhas (alternância e botão; depois seis filtros), o que pesa a tela.

## Objetivo
Cabeçalho de cartão em faixa e barra de ações em uma linha.

## Atores
Todos os usuários.

## Regras de negócio
1. `SecaoCabecalho` passa a ser uma faixa `--surface-2` com raio 10 px, título de 18 px, filete dourado de 3 px e controle à direita.
2. Barra de ações da tela: busca, botão "Filtros" (abre os filtros num flutuante, mostrando quantos estão ativos), troca Quadro/Lista e botão principal — numa linha.
3. Filtros ativos aparecem como pills removíveis abaixo da barra.
4. No celular a barra quebra em duas linhas: busca em cima, ações embaixo.

## Escopo
### Incluído
- `SecaoCabecalho`, `Filtros`, Empresas, Parcerias ativas, Prazos, Renovações.
### Fora do escopo
- Regras de filtragem (não mudam).

## Critérios de aceite
1. Dado o Início, então cada cartão tem a faixa de cabeçalho com "Ver todos" à direita.
2. Dado Empresas, então busca, Filtros, Quadro/Lista e "Nova empresa" ficam numa linha em 1600 px.
3. Dado o filtro "Ouro" ativo, então o botão mostra "Filtros · 1" e aparece a pill "Ouro ×"; clicar no × limpa o filtro.
4. Dado 375 px, então nada transborda na horizontal.

## Restrições
Filtros continuam guardados na URL como hoje.

## Dependências
REQ-026, REQ-021.

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-2701` | Os filtros ficam escondidos no botão ou visíveis? | No botão, com contador e pills |
