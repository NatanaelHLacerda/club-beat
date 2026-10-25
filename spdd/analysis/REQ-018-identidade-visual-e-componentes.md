# Análise — REQ-018 — Identidade visual e biblioteca de componentes
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-018-identidade-visual-e-componentes.md`

## Resumo

Trocar a tipografia pelas fontes da marca e criar as peças comuns (ícones, cartão de número, pill, tabela com ações, avatar, cabeçalho de seção, vazio, busca) que as sementes 019 a 025 vão usar, com uma página de referência.

## Estado atual

- Tokens de cor do tema claro em `src/estilo.css:1-25`; fonte única Sora carregada em `index.html` [m].
- Classes soltas (`.cartao`, `.pill`, `.numero`, `.tabela-rolagem`) repetidas nas telas; não há componentes React de UI além de `Rotulos.tsx` [m].
- Nenhuma biblioteca de ícones [m].

## Estado desejado

Libre Bodoni nos títulos e números de destaque, Space Grotesk no resto; componentes em `src/componentes/ui/`; página `/config/componentes` para a administradora.

## Conceitos e domínio

- Variação "vs mês anterior": (atual − anterior) / anterior; sem anterior ou anterior 0 → "—" [d: semente].
- Cor-sinal do padrão só como detalhe; Master dourado sobre Oceano [d: guia da marca].
- Ícones de traço fino (1,5 px), cor herdada [d].

## Delta

`index.html` (fontes), tokens de tipografia, raio e sombra; `src/regras/variacao.ts`; componentes `Icone`, `CartaoNumero`, `Pill`, `Tabela`, `Avatar`, `SecaoCabecalho`, `Vazio`, `BarraBusca`; página de referência; permissão `ver_componentes` (administradora).

## Riscos

- Bodoni em textos pequenos perde leitura: só títulos de página (h1), números de destaque e marca [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Fontes | Sim | — |
| 2 Variação +20% e "—" | Sim | — |
| 3 Nome da ação e teclado | Sim | — |
| 4 Pill Master | Sim | — |
| 5 Página de referência | Sim | — |

## Direção recomendada

Componentes pequenos sem estado, estilos em CSS por classe (sem CSS-in-JS), ícones SVG num único arquivo.

## Decisões pendentes

DP-1801 (fontes da marca), DP-1802 (SVG próprio), DP-1803 (nome no lugar do logotipo) pela recomendação.

## Prontidão para REASONS

Pronto.
