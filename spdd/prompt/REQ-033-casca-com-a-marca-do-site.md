# REASONS — REQ-033 — Casca com a marca do site
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-033-casca-com-a-marca-do-site.md`
**Análise:** `spdd/analysis/REQ-033-casca-com-a-marca-do-site.md`

## R · Requirements
Menu e cabeçalho com a marca e a voz editorial do site. Fora: conteúdo das telas.

## E · Entities
Sem entidade. `Topo` ganha `acento?: string` (palavra em Libre Bodoni itálico depois do título).

## A · Approach
Bloco único "REQ-033: casca" no `estilo.css`, só com tokens; camadas antigas de casca removidas.

## S · Structure
- `src/estilo.css`
- `src/componentes/Casca.tsx` (`Casca`, `Topo`)

## O · Operations
- **OP-3301 Limpeza.** Remover "Casca (REQ-019)", as regras de `.lateral`/`.barra-superior`/`.bolinha`/rolagem da "Moldura escura" e o bloco "Cabeçalho claro".
- **OP-3302 Menu.** 264 px, Oceano liso, 28/16 px de respiro; logo 150 px e "Parcerias" em caixa-alta dourada; grupos em caixa-alta dourada 12 px; itens 15 px em `--moldura-suave`, hover branco; ativo em `--moldura-3` com traço dourado de 2 px; pai ativo branco com ícone dourado; subitens com linha fina e o traço sobre ela.
- **OP-3303 Cabeçalho.** Branco a 92 % com desfoque, linha fina embaixo, 20/40 px; `.topo-titulo` com eyebrow (contexto) e `h1` 300 de 2 rem (1,5 rem no celular); busca, sino (44 px, contorno `--line-campo`) e usuário (anel dourado) à direita; contador do sino em Oceano.
- **OP-3304 `Topo`.** Eyebrow antes do `h1`; `acento` renderizado como `<span className="acento">`.
- **OP-3305 Celular.** Gaveta com a mesma logo; cabeçalho com botão do menu, estrela Oceano (28 px) e título.

## N · Norms
- N-3301 Nenhum valor de cor solto: só tokens e `color-mix` de token.

## S · Safeguards
- S-3301 Foco visível no menu (dourado) e no cabeçalho (Oceano).
- S-3302 Nada transborda em 375 px; gaveta fecha ao navegar (comportamento atual).

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-3302 | navegador |
| 2 | OP-3303, OP-3304 | navegador |
| 3 | OP-3305 | navegador em 375 px |
