# REQ-026 — Escala, ritmo e profundidade pelo kit
**Status:** APROVADO — Natanael, 2026-10-25 (*"aprovo e siga até o fim."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (kit "CRM Dashboard UI Kit" lido pelo servidor do Figma, arquivo jXAbzyaCTYIqPUbejivp1C)

## Contexto
O kit usa texto base de 14–16 px, títulos de cartão de 18 px, título da tela de 24 px, cartões com 20 px de respiro interno e 30 px entre blocos, sombra suave (0 2 16 px, 10 %) e botão principal em pílula de 46 px. O CRM usa texto de 12–13 px, rótulos em caixa-alta de 10–11 px, blocos colados e sombra pesada.

## Problema
As telas parecem apertadas e miúdas; em 1600 px sobra tela e falta leitura.

## Objetivo
Trazer a escala e o ritmo do kit para os tokens do CRM, mantendo Sora, a paleta do Club e a moldura escura.

## Atores
Todos os usuários.

## Regras de negócio
1. Escala de texto: 13 (apoio), 14 (base), 16 (destaque), 18 (título de cartão), 24 (título da tela). Pesos 400/500/600.
2. Espaçamento: 8, 12, 16, 20, 24, 30; cartões com 20 px internos; 24–30 px entre blocos.
3. Raio 12 px em cartões, 10 px em campos, pílula nos botões principais.
4. Sombra única de cartão: `0 2px 16px rgba(15,29,51,.08)`; a sombra pesada fica só em flutuantes.
5. Botão principal: pílula, 44–46 px de altura, Oceano com texto Areia; secundário com contorno.
6. Rótulos em caixa-alta só onde já são marcadores curtos (grupos do menu); o resto em caixa normal.

## Escopo
### Incluído
- Tokens em `estilo.css`, botões, campos, cartões, pills.
### Fora do escopo
- Estrutura das telas (REQ-027 a 030).

## Critérios de aceite
1. Dado qualquer tela, então o texto do corpo tem 14 px e o título da tela 24 px.
2. Dado um cartão, então o respiro interno é 20 px e a sombra é a nova sombra de cartão.
3. Dado o botão "Nova empresa", então ele é uma pílula de 44–46 px de altura.
4. Dado o detector do impeccable, então nenhuma regra nova é violada.

## Restrições
Sem dependência nova. Fonte Sora, paleta do Club.

## Dependências
REQ-018.

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-2601` | Aumentar a fonte também no celular? | Base 14 px em todas as larguras |
