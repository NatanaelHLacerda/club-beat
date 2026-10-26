# Análise — REQ-034 — Entrada e páginas públicas que geram desejo
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-034-entrada-e-paginas-publicas-que-geram-desejo.md`

## Resumo
Entrada com foto da casa e voz editorial; ficha pública e privacidade com cabeçalho fotográfico e o visual da ficha em modal da landing.

## Estado atual
- `MolduraEntrada` (Entrar, Redefinir senha): painel Oceano com logo e frase + formulário em fundo liso; no celular o painel some e aparece a logo Oceano [m].
- `CabecalhoPublico` (ficha, privacidade): faixa Oceano com logo e frase; formulário em cartão com sombra sobreposto [m].
- `IndicadorEtapas`: bolas numeradas ligadas por linha [m].
- Confirmação da ficha: selo redondo com ✓ [m].
- Fotos do site em `parcerias-lp/img`: `hero-ciclismo-janela.jpg` (2000×1125, 252 KB), `casa-lounge-terraco.jpg` (1400×932, 259 KB), ambas com `alt` no site [m].
- Botão "Continuar →" da ficha traz seta em texto; a seta do botão principal (REQ-032) duplicaria [m].

## Estado desejado
Entrada em duas colunas, metade foto; no celular, faixa de foto no topo. Ficha e privacidade com cabeçalho de foto + Oceano, indicador de etapas em traços (como a modal da landing), formulário em painel branco com borda dourada, confirmação com a estrela e título com acento.

## Delta
- `public/marca/fotos/` (2 fotos, sem reprocessar: já abaixo de 300 KB).
- `src/componentes/Moldura.tsx`: `MolduraEntrada`, `CabecalhoPublico`, `IndicadorEtapas`.
- `src/telas/acesso/Entrar.tsx`, `RedefinirSenha.tsx`: título editorial.
- `src/telas/publico/Formulario.tsx`: botão sem seta em texto; confirmação com estrela.
- `src/estilo.css`: bloco "REQ-025" substituído por "REQ-034".
- Regras da ficha (REQ-002) não mudam.

## Riscos
- Foto grande na entrada pesa no LCP [d]: `fetchpriority="high"`, `decoding="async"`, dimensões declaradas; 252 KB.
- Pessoas na foto do hero: são figurantes de costas/perfil em aula, as mesmas do site público [i].

## Cobertura dos critérios
| Critério | Atendível |
|---|---|
| 1 metade foto | Sim |
| 2 faixa no celular | Sim |
| 3 ficha no visual da modal | Sim, envio inalterado |
| 4 reduced-motion | Sim (regra global já existe) |
| 5 LCP < 2,5 s em 4G | Verificação por medida local (Performance API); Lighthouse fica para produção [i] |

## Direção recomendada
Reescrever as molduras; nenhuma mudança de dados.

## Decisões pendentes
DP-3401 (foto do hero) e DP-3402 (landing mantém a própria modal) na recomendação.

## Prontidão para REASONS
Pronto.
