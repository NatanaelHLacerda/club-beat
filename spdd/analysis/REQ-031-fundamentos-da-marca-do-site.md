# Análise — REQ-031 — Fundamentos da marca do site
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-031-fundamentos-da-marca-do-site.md`

## Resumo
Trocar tokens, tipografia, forma e marca do CRM pelos do site de parcerias (Manual de Marca v2.0), servindo fontes e logo do próprio CRM.

## Estado atual
- `index.html`: Sora pelo Google Fonts; favicon `favicon.svg` genérico [m].
- `src/estilo.css` (709 linhas): `:root` com Areia profunda `#ECE3D2`, Oceano `#142540`, raio 14/12/10 px, sombra de cartão; `html { font-size: 115% }`; camadas sobrepostas por REQ (018, 026–030, moldura escura, cabeçalho claro) com valores fixos de cor e raio [m].
- Marca: selo "CB" + texto "Club Beat · Parcerias" em `Casca.tsx`, `Moldura.tsx` (entrada e páginas públicas) [m].
- Site (`parcerias-lp/css/style.css`): tokens `--oceano #0C1F32`, `--dourado #CBA052`, `--areia #EFE4CE`, `--preto #222223`, `--ceu`, `--salvia`, `--floresta`; Space Grotesk 300–700 + Libre Bodoni itálico; raio 3 px; muted `rgba(12,31,50,.70)`; erro `#8C3B2E`; fontes `.woff2` locais (Fontsource, subconjunto latin, cobre acentos do português) [m].

## Estado desejado
Tokens do site no `:root` do CRM, mantendo os nomes de variável já usados pelo CSS (`--ink`, `--primary`, `--surface`…) para que as regras existentes herdem a marca; fontes locais; logo e estrela do site nas molduras; seção Visual do `CLAUDE.md` reescrita.

## Conceitos e domínio
Sem entidade de domínio. Tokens de marca: Oceano (títulos, ação), Dourado (detalhe), Dourado de texto `#7A5A28` (AA sobre branco, usado no site como `--mel-t`), Areia (faixas), Branco (trabalho).

## Delta
- Banco: nenhum.
- Arquivos: `public/fonts/*.woff2`, `public/marca/{logo-oceano,logo-branco,estrela-oceano,estrela-branco}.png`; `index.html`; `src/estilo.css` (bloco de fontes, `:root`, base); `Casca.tsx` e `Moldura.tsx` (logo no lugar do selo); `CLAUDE.md`.

## Riscos
- Camadas antigas do CSS fixam raios (999 px, 10 px) e cores (`#EFE6D4`, `#F3E6C8`…); até os REQ-032/033/036 algumas peças ficam híbridas [d]. Aceito: cada REQ seguinte remove a sua camada.
- Trocar `html { font-size: 115% }` por 100 % reduz o que está em rem [d]; os blocos REQ-026+ usam px e não mudam.
- PNG da logo (1481×619) servido a 32–40 px de altura: nítido em retina, 19–23 KB [m].

## Cobertura dos critérios
| Critério | Atendível | Lacuna |
|---|---|---|
| 1 fonte local | Sim | — |
| 2 acento só na palavra | Sim (classe `.acento`) | uso nas telas vem em 033–035 |
| 3 canto 3 px | Parcial aqui: tokens; regras com raio fixo saem em 032/033/036 | — |
| 4 logo e estrela | Sim | — |
| 5 contraste AA | Sim nos tokens; verificação por cálculo | — |

## Direção recomendada
Substituir o `:root` do topo e a base tipográfica; neutralizar no bloco REQ-026 os tokens que ele redefine (`--radius`, sombras); remover o Google Fonts.

## Decisões pendentes
DP-3101 (área de trabalho branca), DP-3102 (corpo 16 px, campos e tabelas 15 px, títulos até 2,25 rem), DP-3103 (300 só no título da tela e nos números grandes) na recomendação.

## Prontidão para REASONS
Pronto.
