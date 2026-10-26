# REQ-033 — Casca com a marca do site
**Status:** APROVADO — Natanael, 2026-10-26 (*"aprovo e siga até o fim"*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-26 (*"utilize a logo do site no crm"*).

## Contexto
A casca do CRM (REQ-019) tem menu lateral escuro com o selo "CB", cabeçalho claro com título, busca, sino e usuário. O site abre com cabeçalho branco translúcido, logo à esquerda, barra de progresso dourada e títulos editoriais (eyebrow com traço dourado + título leve com acento itálico).

## Problema
O menu e o cabeçalho não mostram a marca da casa nem a voz editorial do site.

## Objetivo
Casca com a logo do site e o cabeçalho de tela no tom editorial do site.

## Atores
Todos os usuários.

## Regras de negócio
1. Menu lateral em Oceano, com a logo branca do site no topo (sem o selo "CB" e sem o texto "Club Beat · Parcerias" duplicado; "Parcerias" vira o rótulo abaixo da logo).
2. Grupos do menu com o eyebrow do site (caixa-alta pequena); item ativo com marcador dourado à esquerda; subitens (Empresas › Geral/Recusadas) mantidos.
3. Cabeçalho da tela: eyebrow com traço dourado + título leve (300) com acento opcional em Libre Bodoni itálico; busca, sino e usuário à direita no padrão dos campos do REQ-032.
4. No celular, a gaveta do menu mostra a mesma logo; cabeçalho compacto com a estrela.

## Escopo
### Incluído
- `src/componentes/Casca.tsx`, `casca/*`, `Topo`, estilos da casca.
### Fora do escopo
- Conteúdo das telas.

## Critérios de aceite
1. Dado qualquer tela logada, então o topo do menu mostra a logo "The Beat Life Club" branca, nítida em tela retina.
2. Dado o título de uma tela, então ele tem eyebrow com traço dourado e título no estilo do site.
3. Dado o celular (375 px), então a gaveta abre com a logo e o cabeçalho mostra a estrela.

## Restrições
Sem dependência nova.

## Dependências
REQ-031, REQ-032, REQ-019.

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-3301` | Menu lateral fica escuro (Oceano) ou claro como o cabeçalho do site? | Oceano: separa navegação do trabalho e dá o peso da marca |
