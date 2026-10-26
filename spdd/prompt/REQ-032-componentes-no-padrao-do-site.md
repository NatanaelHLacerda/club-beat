# REASONS — REQ-032 — Componentes no padrão do site
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-032-componentes-no-padrao-do-site.md`
**Análise:** `spdd/analysis/REQ-032-componentes-no-padrao-do-site.md`

## R · Requirements
Peças do CRM no padrão do site, mesma API. Fora: casca (033) e regras próprias das telas (034–036).

## E · Entities
Sem entidade. Token novo: `--line-campo: #8C949E` (borda de campo, 3:1).

## A · Approach
Bloco único "REQ-032: peças" no `estilo.css`; regras de peça das camadas antigas removidas. Seta do botão principal por CSS (`mask` com SVG), só quando o botão não traz ícone próprio.

## S · Structure
- `src/estilo.css`
- `src/componentes/ui/componentes.tsx` (tons do avatar)
- `src/telas/config/Componentes.tsx`

## O · Operations
- **OP-3201 Limpeza.** Remover do `estilo.css` as seções "Peças", "Tabelas", "Abas", "Números", o bloco REQ-018, as regras de painel lateral/alternador/filtros do REQ-021, as regras de peça de "Área de trabalho" e "Estados sem faixa lateral", os blocos REQ-026/027/028 e as linhas finais de tabela/cartão de número.
- **OP-3202 Ritmo.** `.conteudo` 32/40 px e 28 px entre blocos (20/16 e 20 no celular); grades com 24 px; `.pequeno` 14 px.
- **OP-3203 Cartão.** Branco, linha de 1 px, 3 px, 24 px de respiro, sem sombra; `.destaque` com traço dourado de 2 px no topo. Cartão de número com rótulo em eyebrow e valor em 300, 2,75 rem.
- **OP-3204 Cabeçalho de seção.** Título 1,125 rem/500 com traço dourado de 24×1 px; linha fina embaixo; "Ver todos" em caixa-alta com seta.
- **OP-3205 Botões.** 44 px, caixa-alta .1em, 13 px/500, 3 px. Principal Oceano (hover Preto) com seta que anda; contorno na cor do texto (hover preenche Oceano); leve sem borda; perigo em `--danger`; `.grande` 52 px. Botão de ícone 32 px com dica em Oceano.
- **OP-3206 Campos.** Rótulo caixa-alta 12 px .1em `--muted`; caixa 46 px, `--line-campo`, foco com contorno Oceano; `select` com seta desenhada; erro e ajuda em 14 px abaixo; caixa de marcar 18 px em Oceano. Busca no mesmo padrão.
- **OP-3207 Rótulos.** Pill reta caixa-alta 12 px com fundo tingido (Sálvia, Dourado, erro) e texto AA; padrão com quadrado de 8 px; Master em Dourado sobre Oceano; "exemplo" com borda tracejada dourada; avatar nos tons do Manual.
- **OP-3208 Tabela.** Moldura de 1 px; cabeçalho caixa-alta 12 px com linha Oceano embaixo; linhas de 52 px separadas por linha fina, sem zebra; hover Areia clara; atraso/alerta por fundo tingido.
- **OP-3209 Abas, alternador e filtros.** Abas em caixa-alta com traço dourado na ativa; alternador e grupos de abas retos com o ativo em Oceano; botão Filtros com contador Oceano; painel de filtros e flutuantes com borda dourada de 2 px no topo.
- **OP-3210 Painel lateral.** Branco, 440 px, borda dourada no topo, título 300; fundo Oceano translúcido com desfoque.
- **OP-3211 Estados.** Aviso com fundo tingido e borda de 1 px; vazio com borda tracejada; carregando em faixas retas.
- **OP-3212 Referência.** `/config/componentes` com Botões, Campos (com erro), Alternador e Painel lateral.

## N · Norms
- N-3201 Toda cor por token ou `color-mix` de token; nenhum hexadecimal novo fora do `:root`.
- N-3202 Caixa-alta só em botão, rótulo, pill e cabeçalho de tabela; nunca em texto corrido.

## S · Safeguards
- S-3201 Contraste: texto AA; bordas de campo e controles ≥ 3:1.
- S-3202 Foco visível em toda peça interativa.
- S-3203 `pnpm typecheck` sem mudar o uso das peças nas telas.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-3203–3212 | navegador em `/config/componentes` |
| 2 | OP-3205 | navegador em `/empresas` |
| 3 | OP-3206 | navegador: formulário com erro |
| 4 | todas | `pnpm typecheck` |
