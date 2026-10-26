# REQ-031 — Fundamentos da marca do site
**Status:** APROVADO — Natanael, 2026-10-26 (*"aprovo e siga até o fim"*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-26 (*"refatorarmos o design system do crm para seguir o do site"*; *"utilize a logo do site no crm"*; *"o CRM precisa gerar desejo"*). Referência: https://site-beat-life-club.vercel.app/ (código em `~/Documents/amigos/parcerias-lp`, tokens em `css/style.css`, cabeçalho "Manual de Marca, design-beat v2.0").

## Contexto
O site de parcerias usa o Manual de Marca v2.0: Space Grotesk (texto e títulos, títulos leves em 300) com acento em Libre Bodoni itálico; Oceano `#0C1F32`, Dourado `#CBA052`, Branco, Areia `#EFE4CE`, Preto `#222223`, Céu `#88BEE7`, Sálvia `#809E80`, Floresta `#0A3A1E`; cantos retos (3 px); linhas finas; rótulo de seção (eyebrow) em caixa-alta com traço dourado; botões retos em caixa-alta com espaçamento de letras; logo "The Beat Life Club" (`img/logo-oceano.png`, `img/logo-branco.png`) e a estrela (`img/estrela-*.png`).
O CRM (REQ-018 a 030) usa Sora, Oceano `#142540`, fundo Areia profunda, cantos de 12–14 px, botão em pílula, sombra de cartão e o selo "CB" no lugar da logo.

## Problema
O CRM parece outro produto ao lado do site: fonte, cantos, botões e marca diferentes. Quem passa do site para o CRM (Fernanda, Direção, parceiro na ficha pública) não reconhece a mesma casa, e o CRM não transmite o padrão premium que a Beat vende.

## Objetivo
Trocar os fundamentos do design system do CRM pelos do site: tokens de cor, tipografia, forma, linha, marca. Base para os REQ-032 a 036.

## Atores
Todos os usuários e o público da ficha.

## Regras de negócio
1. Paleta do Manual v2.0 nos tokens do CRM (`--oceano`, `--dourado`, `--areia`, `--branco`, `--preto`, `--ceu`, `--salvia`, `--floresta`), com os papéis: Oceano em títulos e ação principal; Dourado só como detalhe (traço do eyebrow, marcador ativo, foco no escuro); Areia em superfícies de leitura longa; Branco nas áreas de trabalho e cartões.
2. Tipografia: Space Grotesk 300/400/500/700 no texto e nos títulos; Libre Bodoni itálico só como acento de uma ou duas palavras em títulos de tela e em momentos de marca (entrada, painel, confirmação). Nunca em tabela, campo ou rótulo.
3. Fontes servidas pelo próprio CRM (os `.woff2` do site, licença OFL), sem Google Fonts.
4. Forma: raio 3 px em cartão, campo, botão, chip e painel; avatar continua redondo.
5. Linhas finas (1 px, Oceano a 12 %) separam blocos no lugar de sombras; sombra só em flutuantes (menu, modal, painel lateral).
6. Logo do site no lugar do selo "CB": `logo-branco` sobre fundo Oceano, `logo-oceano` sobre fundo claro; estrela como favicon e marca reduzida.
7. Contraste AA em todo texto; dourado nunca como cor de texto sobre fundo claro (usa Dourado escuro para texto, se preciso).

## Escopo
### Incluído
- `src/estilo.css` (tokens e base), `index.html` (fontes, favicon), `public/` (fontes, logo, estrela).
- Atualizar a seção Visual do `CLAUDE.md`.
### Fora do escopo
- Peças (REQ-032), casca (REQ-033), telas (REQ-034 a 036).

## Critérios de aceite
1. Dado qualquer tela, então o texto usa Space Grotesk e nenhuma requisição vai para fonts.googleapis.com.
2. Dado um título de tela com acento, então só a palavra de acento está em Libre Bodoni itálico.
3. Dado um cartão, campo ou botão, então o canto tem 3 px.
4. Dado o menu lateral e a tela de entrada, então aparece a logo "The Beat Life Club" do site, e a aba do navegador mostra a estrela.
5. Dado o verificador de contraste, então todo texto atinge AA.

## Restrições
Sem dependência nova. Arquivos de marca copiados de `parcerias-lp` (não linkados de fora).

## Dependências
REQ-018, REQ-026.

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-3101` | Fundo da área de trabalho: Branco (como o site) ou Areia (como hoje)? | Branco na área de trabalho, Areia em faixas de destaque e painéis de leitura |
| `DP-3102` | Escala de texto: manter a do REQ-026 (+15 %) ou adotar a do site (corpo 17 px, títulos fluidos)? | Corpo 16 px, títulos de tela até 2,25 rem; tabelas e campos 15 px |
| `DP-3103` | Títulos em peso 300 (site) também nas telas de trabalho? | 300 só no título da tela e nos números grandes; 500 em títulos de cartão |
