# REASONS — REQ-018 — Identidade visual e biblioteca de componentes
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-018-identidade-visual-e-componentes.md`
**Análise:** `spdd/analysis/REQ-018-identidade-visual-e-componentes.md`

## R · Requirements

Peças visuais únicas, com a identidade do Club, para o redesenho de todas as telas. Fora: redesenho das telas, modo escuro.

## E · Entities

- `Variacao`: `{ percentual: number | null, direcao: 'sobe' | 'desce' | 'igual' | null }`.
- `NomeIcone`: união dos ícones do conjunto (menu, ações, setas, busca, sino).
- `ColunaTabela<T>` (`titulo`, `render`, `classe?`) e `AcaoTabela<T>` (`rotulo`, `icone`, `aoClicar`, `mostrar?`).

## A · Approach

Fontes do guia via Google Fonts; tokens `--font-titulo` e `--font`. Componentes de apresentação em `src/componentes/ui/`, sem chamada de dados. Variação calculada por função pura. A tabela recebe colunas e ações; cada ação é um botão com ícone, `aria-label` e dica no foco e no passar do mouse.

## S · Structure

- `index.html`, `src/estilo.css`
- `src/regras/variacao.ts` + `variacao.test.ts`
- `src/componentes/ui/Icone.tsx`, `CartaoNumero.tsx`, `Pill.tsx`, `Tabela.tsx`, `Avatar.tsx`, `SecaoCabecalho.tsx`, `Vazio.tsx`, `BarraBusca.tsx`, `index.ts`
- `src/componentes/Rotulos.tsx` (passa a usar `Pill`)
- `src/telas/config/Componentes.tsx`, `src/App.tsx`, `src/lib/permissoes.ts`, `src/componentes/Casca.tsx`

## O · Operations

- **OP-1801 Tipografia e tokens.** Fontes Libre Bodoni (400/600) e Space Grotesk (400/500/600); `h1`, `.destaque-numero` e `.marca b` em Bodoni; raio 12–16 px, sombra suave para flutuantes.
- **OP-1802 Variação.** `calcularVariacao(atual, anterior)` e `textoVariacao`. Verifica: teste 12 vs 10 → "+20%"; anterior 0 ou nulo → null.
- **OP-1803 Ícones.** ~28 ícones de traço 1,5 px, `currentColor`, tamanho por prop, `aria-hidden`.
- **OP-1804 Componentes.** `CartaoNumero` (marcador dourado, rótulo, número em Bodoni, variação com seta e cor, ajuda), `Pill` (tons neutro, ok, alerta, perigo, ouro, padrões), `Tabela` (cabeçalho discreto, linha clicável opcional, coluna de ações), `Avatar` (iniciais, cor derivada do nome dentro da paleta), `SecaoCabecalho` (título, ação "Ver todos"), `Vazio`, `BarraBusca`.
- **OP-1805 Referência.** `/config/componentes` só para administradora: todas as peças em carregando, vazio e dado.

## N · Norms

- N-1801 Regras do `CLAUDE.md`; paleta do guia; vocabulário do Club.

## S · Safeguards

- S-1801 Variação sem base: "—".
- S-1802 Toda ação de ícone tem `aria-label` e dica visível no foco.
- S-1803 Cor-sinal nunca como fundo inteiro, exceto Master (dourado sobre Oceano).

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-1801 | navegador (fonte computada) |
| 2 | OP-1802, OP-1804 | teste + navegador |
| 3 | OP-1804 | navegador |
| 4 | OP-1804 | navegador |
| 5 | OP-1805 | navegador |
