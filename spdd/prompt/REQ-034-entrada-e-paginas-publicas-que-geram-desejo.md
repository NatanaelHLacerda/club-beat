# REASONS — REQ-034 — Entrada e páginas públicas que geram desejo
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-034-entrada-e-paginas-publicas-que-geram-desejo.md`
**Análise:** `spdd/analysis/REQ-034-entrada-e-paginas-publicas-que-geram-desejo.md`

## R · Requirements
Entrada, redefinição de senha, ficha pública e privacidade com a experiência do site. Fora: campos e regras da ficha.

## E · Entities
Sem entidade. Fotos: `public/marca/fotos/hero-ciclismo-janela.jpg` (entrada) e `casa-lounge-terraco.jpg` (cabeçalho público).

## A · Approach
Molduras reescritas em `Moldura.tsx`; telas só trocam o título. Animação de entrada por CSS (`.revela`), desligada pela regra global de `prefers-reduced-motion`.

## S · Structure
- `public/marca/fotos/`
- `src/componentes/Moldura.tsx`
- `src/telas/acesso/Entrar.tsx`, `RedefinirSenha.tsx`
- `src/telas/publico/Formulario.tsx`
- `src/estilo.css` (bloco REQ-034 no lugar do REQ-025)

## O · Operations
- **OP-3401 Fotos.** Copiar as duas fotos do site para `public/marca/fotos/`.
- **OP-3402 `MolduraEntrada`.** Coluna da foto (`<img>` com `alt` do site, `fetchpriority="high"`, `object-fit: cover`), véu Oceano embaixo, logo branca no topo, eyebrow "CRM de Parcerias" e frase "Uma parceria boa começa *pelo membro.*" na base; coluna do formulário com logo Oceano e eyebrow. No celular, a foto vira faixa de 220 px com a logo.
- **OP-3403 Títulos.** Entrar: "Entre na *casa.*"; Redefinir: "Crie a sua *nova senha.*".
- **OP-3404 `CabecalhoPublico`.** Foto do terraço ao fundo com véu Oceano, logo branca, eyebrow "Ficha de parceria" e título com acento ("Conte quem é *a sua marca.*" por padrão); prop `titulo`/`acento` para a privacidade.
- **OP-3405 `IndicadorEtapas`.** Traços: cada etapa com linha de 2 px no topo (feita Oceano, atual Dourado) e nome em caixa-alta; no celular só o nome da atual.
- **OP-3406 Ficha.** Painel branco com linha fina e borda dourada no topo; "Continuar" sem seta em texto; confirmação com a estrela Oceano e "Ficha *enviada.*".
- **OP-3407 Movimento.** `.revela` (opacidade e 16 px de deslocamento, 0,6 s) na foto e no título.

## N · Norms
- N-3401 Imagem com `width`/`height` declarados; foto decorativa repetida com `alt=""`.

## S · Safeguards
- S-3401 Envio da ficha inalterado (`enviarFicha`).
- S-3402 Nada transborda em 375 px; formulário da entrada cabe sem rolagem lateral.
- S-3403 Texto sobre foto sempre sobre véu Oceano com contraste AA.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-3402 | navegador 1440 px |
| 2 | OP-3402 | navegador 375 px |
| 3 | OP-3404–3406 | navegador + envio no banco local |
| 4 | OP-3407 | regra global de reduced-motion |
| 5 | OP-3401, OP-3402 | Performance API (LCP) local |
