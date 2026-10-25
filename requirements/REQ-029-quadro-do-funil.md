# REQ-029 — Quadro do funil no padrão do kit
**Status:** APROVADO — Natanael, 2026-10-25 (*"aprovo e siga até o fim."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (kit "CRM Dashboard UI Kit" lido pelo servidor do Figma, arquivo jXAbzyaCTYIqPUbejivp1C)

## Contexto
No quadro de leads do kit, cada coluna abre com uma faixa tingida na cor do estado e o contador em pílula; os cartões têm ícone, título, resumo de duas linhas, divisória e uma grade chave–valor (Empresa, Início, Prazo, Origem), com menu "⋯" (Editar, Excluir).

## Problema
No Quadro do CRM todas as colunas têm o mesmo cabeçalho neutro, então não se vê de longe onde está o gargalo; os cartões são miúdos (texto de 11–12 px) e o rodapé quebra em duas linhas ("Sem responsável", "1 d na etapa"); as colunas de Contrato em diante só aparecem rolando para o lado.

## Objetivo
Colunas com cabeçalho por etapa e cartões em grade chave–valor.

## Atores
Gerente, Diretoria e quem vê o funil.

## Regras de negócio
1. Faixa da coluna tingida por grupo de etapa: entrada (neutro), em andamento (dourado claro), decisão (Oceano claro), fechado (verde claro), recusado/em espera (vermelho claro).
2. Contador em pílula branca à direita.
3. Cartão: avatar, marca, pill de padrão; linhas Segmento, Responsável, Desde, Prazo.
4. Menu "⋯" com Abrir ficha e Mover etapa (só para quem pode, via `permissoes.ts`).
5. Atrasado: cartão tingido de alerta e borda de 1 px, sem faixa lateral.

## Escopo
### Incluído
- Quadro de `TelaEmpresas`, `CartaoEmpresa`.
### Fora do escopo
- O arrastar entre colunas, que continua como hoje.

## Critérios de aceite
1. Dado o Quadro, então "Em proposta" tem faixa dourado claro e o contador certo.
2. Dado um cartão, então aparecem Segmento, Responsável, Desde e Prazo alinhados em grade.
3. Dado a Isabela, então o menu "⋯" não mostra "Mover etapa" onde ela não pode.

## Restrições
Sem dependência nova.

## Dependências
REQ-026, REQ-021.

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-2901` | O arrastar continua? | Sim; o menu "⋯" é um caminho a mais |
