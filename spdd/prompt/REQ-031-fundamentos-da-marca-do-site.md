# REASONS — REQ-031 — Fundamentos da marca do site
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-031-fundamentos-da-marca-do-site.md`
**Análise:** `spdd/analysis/REQ-031-fundamentos-da-marca-do-site.md`

## R · Requirements
CRM com a paleta, a tipografia, a forma e a marca do site de parcerias. Fora: peças (032), casca (033), telas (034–036).

## E · Entities
Sem entidade. Tokens:

| Token | Valor | Papel |
|---|---|---|
| `--oceano` / `--ink` / `--primary` | `#0C1F32` | títulos, ação principal |
| `--branco` / `--bg` / `--bg-2` / `--surface` | `#FFFFFF` | área de trabalho, cartões, campos |
| `--areia` | `#EFE4CE` | faixas de destaque |
| `--areia-clara` / `--surface-2` | `#F7F2E7` | cabeçalhos e painéis tingidos |
| `--dourado` / `--gold-soft` / `--marcador` | `#CBA052` | detalhe: traço, marcador, foco no escuro |
| `--gold` (dourado de texto) | `#7A5A28` | rótulo/link dourado sobre claro (AA) |
| `--text` | `#1E2E42` | texto corrido |
| `--muted` | `#55606E` | apoio (AA sobre branco e Areia) |
| `--line` | `#DCE0E5` | linhas de 1 px (Oceano ~12 %) |
| `--preto`, `--ceu`, `--salvia`, `--floresta` | do Manual v2.0 | apoio e grupos |
| `--danger` | `#8C3B2E` | erro (o mesmo do site) |
| `--radius`, `--radius-p` | `3px` | todos os cantos |
| `--sombra` | `0 24px 60px rgba(12,31,50,.22)` | só flutuantes |
| `--sombra-cartao`, `--sombra-cartao-alta` | `none` | cartão sem sombra |
| `--font`, `--font-titulo` | Space Grotesk | texto e títulos |
| `--font-acento` | Libre Bodoni itálico | acento editorial |

## A · Approach
Manter os nomes de variável que o CSS já usa e trocar só os valores, para a marca chegar a todas as telas de uma vez; acrescentar os nomes do Manual (`--oceano`…) para as camadas novas.

## S · Structure
- `public/fonts/`, `public/marca/`
- `index.html`
- `src/estilo.css` (topo: `@font-face`, `:root`, base; bloco REQ-026: tokens neutralizados)
- `src/componentes/Casca.tsx`, `src/componentes/Moldura.tsx`
- `CLAUDE.md`

## O · Operations
- **OP-3101 Arquivos de marca.** Copiar de `parcerias-lp` as 8 fontes `.woff2` para `public/fonts/` e logo/estrela (Oceano e branco) para `public/marca/`.
- **OP-3102 `index.html`.** Remover Google Fonts; favicon da estrela (Oceano no claro, branca no escuro, por `media`); `preload` da Space Grotesk 400.
- **OP-3103 Fontes.** `@font-face` para Space Grotesk 300/400/500/700 e Libre Bodoni 400/500 normal e itálico, `font-display: swap`.
- **OP-3104 Tokens.** `:root` da tabela de Entities; `color-scheme: light`.
- **OP-3105 Base.** `html { font-size: 100% }`; corpo 16 px/1.6 em `--font`; `h1` 300 com `letter-spacing -.02em`; `h2`/`h3` 500; `.acento` em `--font-acento` itálico 400; `.eyebrow` caixa-alta .1em 500 `--muted` com traço dourado de 34 px antes; foco 2 px Oceano (dourado dentro de `.lateral`); seleção em Areia.
- **OP-3106 Bloco REQ-026.** Trocar `--radius: 12px` e as sombras de cartão pelos novos valores (3 px, `none`).
- **OP-3107 Logo.** `Casca.tsx`: `<img src="/marca/logo-branco.png" alt="The Beat Life Club">` no lugar do selo e do texto; `Moldura.tsx`: logo branca no painel Oceano e no cabeçalho público, logo Oceano na versão móvel.
- **OP-3108 `CLAUDE.md`.** Reescrever a seção Visual pelo Manual v2.0 (cadeia REQ-031 a 036).

## N · Norms
- N-3101 Nenhuma fonte externa; nenhuma dependência nova.
- N-3102 Dourado `#CBA052` nunca como cor de texto sobre fundo claro; texto dourado usa `--gold`.

## S · Safeguards
- S-3101 Contraste AA (4,5:1) de `--text`, `--muted` e `--gold` sobre `#FFFFFF` e `#EFE4CE`.
- S-3102 Nada transborda em 375 px.
- S-3103 `alt` da logo com o nome da casa; logo decorativa repetida leva `alt=""`.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-3101–3103 | navegador: `document.fonts` e rede sem fonts.googleapis.com |
| 2 | OP-3105 | navegador: estilo calculado de `.acento` |
| 3 | OP-3104, OP-3106 | navegador: `--radius` = 3px |
| 4 | OP-3101, OP-3102, OP-3107 | navegador: menu, entrada, favicon |
| 5 | OP-3104 | cálculo de contraste |
