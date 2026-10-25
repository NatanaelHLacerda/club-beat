# REQ-020 — Painel inicial no estilo do kit
**Status:** RASCUNHO
**Origem:** conversa de 2026-10-25 (kit: tela "Dashboard" com cartões de número, gráfico de barras em pontos, rosca de resumo e lista de tarefas)

## Contexto

O Painel atual (REQ-016) é uma tabela de indicadores. O kit abre com uma visão de painel: quatro números com variação, gráfico do mês, resumo em rosca e a lista do que fazer.

## Problema

Para saber como está o funil e o que fazer hoje, é preciso abrir Painel, Prazos e Funil separadamente.

## Objetivo

Uma tela inicial que reúne números, gráficos e pendências do dia, no estilo do kit e com as regras da marca.

## Atores

Todos; a lista "Para hoje" mostra o que é do papel ou da pessoa logada.

## Regras de negócio

1. Quatro cartões de número com variação vs mês anterior: empresas que chegaram, parcerias ativas, propostas em andamento, receita mensal de parcerias ("R$ …" enquanto houver valores pendentes).
2. Gráfico de barras em pontos: empresas que chegaram por dia no mês (estilo do kit, em azul Oceano; o dia de maior valor com o número em destaque).
3. Funil em barras horizontais que estreitam, em degradê de azul (Oceano → Azul 4), com a contagem por etapa (guia da marca, cap. 2).
4. Rosca de parcerias ativas por padrão, com cor-sinal só nos arcos e legenda.
5. Lista "Para hoje": prazos atrasados e que vencem hoje (REQ-014), com ícone, empresa e data; "Ver todos" leva a Prazos.
6. Próximas datas do calendário (5) e renovações nos próximos 90 dias (3).
7. A tabela de indicadores do REQ-016 continua acessível em "Indicadores detalhados".
8. Dado ausente aparece "—"; nenhum número inventado.

## Escopo

### Incluído
- Nova rota inicial `/inicio` (o login leva para ela), gráficos em SVG próprio, consulta dos indicadores do mês atual e do anterior.

### Fora do escopo
- Novos indicadores além dos do REQ-016.

## Critérios de aceite

1. Dado 6 empresas em outubro e 4 em setembro, então o cartão mostra "6" e "+50% vs mês anterior".
2. Dado o funil com 1 Recebida e 2 em Triagem 1, então as barras mostram essas contagens, do mais largo ao mais estreito, em azul.
3. Dado 1 parceria Ouro ativa e nenhuma outra, então a rosca mostra 100% Ouro e a legenda lista os quatro padrões com 0 nos demais.
4. Dado um prazo atrasado da Fernanda, quando ela entra, então "Para hoje" mostra o item com a etiqueta "Atrasado".
5. Dado a tela de 375 px, então os cartões ficam em uma coluna e os gráficos não estouram a largura.

## Restrições

Gráficos sem biblioteca nova (SVG próprio). Acessível: cada gráfico tem resumo em texto.

## Dependências

REQ-018, REQ-019, REQ-016, REQ-014.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-2001` | A tela inicial substitui o Funil como página de entrada? | Sim, `/inicio` vira a entrada |
