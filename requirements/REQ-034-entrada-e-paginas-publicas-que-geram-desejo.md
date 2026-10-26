# REQ-034 — Entrada e páginas públicas que geram desejo
**Status:** APROVADO — Natanael, 2026-10-26 (*"aprovo e siga até o fim"*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-26 (*"o CRM precisa gerar desejo"*).

## Contexto
O site gera desejo com foto grande da casa (bike em sala escura, terraço, lounge), título editorial, ritmo generoso e poucas palavras. As páginas públicas do CRM (`/entrar`, `/redefinir-senha`, `/seja-parceiro`, `/seja-parceiro/privacidade`) usam um cartão sobre fundo liso (REQ-025). A ficha pública do CRM tem 5 etapas; a landing já tem a mesma ficha em modal (`parcerias-lp/js/ficha.js`).

## Problema
A primeira coisa que a equipe e os parceiros veem do CRM é uma tela utilitária, sem a experiência da marca.

## Objetivo
Páginas públicas com a experiência do site: a pessoa sente que entrou na Beat.

## Atores
Equipe (entrada) e empresas candidatas (ficha pública).

## Regras de negócio
1. Entrada em duas colunas: foto da casa ocupando metade (com crédito do espaço, sem pessoas identificáveis em close quando possível), formulário à direita com logo Oceano, eyebrow "CRM de Parcerias" e título editorial com acento itálico. No celular, a foto vira faixa no topo.
2. Ficha pública `/seja-parceiro` no visual da modal da landing: indicador de etapas com traço dourado, campos e botões do REQ-032, confirmação com a estrela e título editorial.
3. Fotos servidas pelo próprio CRM em tamanho para web (até 300 KB cada, `loading` e `fetchpriority` corretos), com texto alternativo.
4. Nada de dado de membro ou pessoa identificável em texto.
5. Movimento: entrada suave da foto e do título (como o "reveal" do site), desligado com `prefers-reduced-motion`.

## Escopo
### Incluído
- `src/telas/acesso/*`, `src/telas/publico/*`, `src/componentes/Moldura.tsx`, fotos em `public/marca/`.
### Fora do escopo
- Mudar campos ou regras da ficha (REQ-002).

## Critérios de aceite
1. Dado `/entrar` no computador, então metade da tela é foto da casa e a outra metade o formulário com a logo do site.
2. Dado `/entrar` no celular, então a foto aparece como faixa no topo e o formulário cabe sem rolagem lateral.
3. Dado `/seja-parceiro`, então o visual é o mesmo da ficha em modal da landing e o envio continua entrando no funil.
4. Dado `prefers-reduced-motion`, então nada se move.
5. Dado o Lighthouse da entrada, então LCP abaixo de 2,5 s em 4G.

## Restrições
Sem dependência nova. Fotos do acervo do site (`parcerias-lp/img`).

## Dependências
REQ-031, REQ-032, REQ-025.

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-3401` | Qual foto na entrada? | `hero-ciclismo-janela.jpg` (a mesma do topo do site), com `casa-lounge-terraco.jpg` como alternativa |
| `DP-3402` | Unificar a ficha: a landing passa a abrir `/seja-parceiro` em vez da própria modal? | Não agora: manter as duas, com o mesmo visual e o mesmo envio |
