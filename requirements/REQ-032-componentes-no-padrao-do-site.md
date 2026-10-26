# REQ-032 — Componentes no padrão do site
**Status:** APROVADO — Natanael, 2026-10-26 (*"aprovo e siga até o fim"*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-26 (mesma do REQ-031).

## Contexto
O site tem um repertório pequeno e firme: botão principal Oceano e botão de contorno, ambos retos e em caixa-alta com seta; chip de filtro reto (ativo em Oceano); campo com rótulo em caixa-alta pequena; cartão branco sem sombra; eyebrow com traço dourado; erro em `#8C3B2E`; modal com borda dourada no topo (ficha de parceria). As peças do CRM ficam em `src/componentes/ui` (REQ-018) com referência em `/config/componentes`.

## Problema
As peças atuais (pílula, sombra, cantos de 12 px, Sora) contradizem os fundamentos do REQ-031; trocar só os tokens deixaria peças híbridas.

## Objetivo
Refazer as peças de `src/componentes/ui` no padrão do site, mantendo a API (props) para que as telas não mudem de código.

## Atores
Todos os usuários.

## Regras de negócio
1. Botão principal: Oceano, texto branco, caixa-alta com espaçamento .1em, seta que anda no hover; altura 44 px nas telas de trabalho (52 px em telas de marca). Contorno: borda na cor do texto, preenche no hover.
2. Campo: rótulo em caixa-alta pequena (Oceano a 70 %), caixa reta com linha de 1 px, foco com contorno Oceano; erro abaixo, em texto, nunca só pela cor.
3. Chip de filtro e alternador (Quadro/Lista): retos, ativo em Oceano.
4. Pill de etapa e de padrão: reta, fundo tingido, texto escuro; Master em Dourado sobre Oceano.
5. Cartão: branco, linha fina, sem sombra; cabeçalho de cartão (`SecaoCabecalho`) com eyebrow.
6. Painel lateral e modal: borda dourada de 2 px no topo, fundo Oceano translúcido com desfoque atrás.
7. Tabela: cabeçalho em caixa-alta pequena, linhas separadas por linha fina, sem zebra.
8. `/config/componentes` mostra todas as peças novas.

## Escopo
### Incluído
- `src/componentes/ui/*`, `src/componentes/Filtros.tsx`, `Rotulos.tsx`, estilos correspondentes, `/config/componentes`.
### Fora do escopo
- Casca e telas.

## Critérios de aceite
1. Dado `/config/componentes`, então botões, campos, chips, pills, cartão, tabela, painel lateral e modal aparecem no padrão do site.
2. Dado o botão "Nova empresa", então ele é reto, em caixa-alta, Oceano, com seta.
3. Dado um campo com erro, então a mensagem aparece em texto abaixo do campo e o campo tem `aria-invalid`.
4. Dado `pnpm typecheck`, então nenhuma tela precisou mudar a forma de usar as peças.

## Restrições
Sem dependência nova. API das peças preservada.

## Dependências
REQ-031.

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-3201` | Botões secundários pequenos (ações de linha da tabela) também em caixa-alta? | Não: ações de linha ficam como ícone com dica; caixa-alta só em botões de texto |
