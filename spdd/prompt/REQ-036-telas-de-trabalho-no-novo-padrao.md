# REASONS — REQ-036 — Telas de trabalho no novo padrão
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-036-telas-de-trabalho-no-novo-padrao.md`
**Análise:** `spdd/analysis/REQ-036-telas-de-trabalho-no-novo-padrao.md`

## R · Requirements
Telas de trabalho só com tokens e peças do design system do site, mesma densidade e comportamento. Fora: funções novas.

## E · Entities
Sem entidade. Tokens novos: `--warn-texto: #5A4210`, `--danger-texto: #7A2A1D`. Paleta dos gráficos: degradê Oceano → Céu (`#0C1F32 … #88BEE7`); padrões Bronze `#8C5A2B`, Prata `#9AA1AD`, Ouro `#CBA052`, Master `#0C1F32`; trilho Areia `#EFE4CE`.

## A · Approach
Bloco "REQ-036: telas" com uma subseção por área; seções antigas de tela removidas.

## S · Structure
- `src/estilo.css`
- `src/regras/graficos.ts`, `src/regras/graficos.test.ts`, `src/componentes/graficos/Graficos.tsx`

## O · Operations
- **OP-3601 Tokens e limpeza.** Tokens de texto de estado no `:root`; peças passam a usá-los; remover as seções de tela antigas e `.card`.
- **OP-3602 Funil.** Colunas de 300 px, fundo Areia clara, cabeçalho tingido por grupo (entrada Branco com linha, andamento Areia, decisão Céu 30 %, fechado Sálvia 28 %, saída erro 10 %) com nome em caixa-alta e contagem reta; cartão de empresa branco com linha fina, 3 px, 14 px de respiro; atrasado e vence hoje por fundo tingido e borda; arrastar sobre a coluna com contorno dourado.
- **OP-3603 Ficha.** Caminho com marcadores quadrados (feito Oceano, atual com traço dourado), nome da empresa em 300; painel de dados e blocos das abas em Areia clara com linha fina; grupos de abas retos (ativo Oceano); próximo passo em Oceano com botão Dourado; anotar com linha fina e 3 px.
- **OP-3604 Calendário.** Mês (ano) e grades de semana/mês com linhas finas; hoje com traço dourado; reservada em Dourado 22 %, confirmada em Oceano; selos A/V retos.
- **OP-3605 Início e listas.** Grades, lista de tarefas, bloco de data reto com linha, ícones de prazo tingidos por token; gráficos com a paleta nova; `ul.legenda` e `legend.legenda` separados.
- **OP-3606 Diversos.** `.codigo`, `.tela-solta`, `.sr-only`, `.ok`, `.destaque-texto` com tokens.

## N · Norms
- N-3601 Fora do `:root`, nenhum hexadecimal; raio só `var(--radius)` ou 50 % em círculos; sombra só `var(--sombra)`.

## S · Safeguards
- S-3601 Comportamento, permissões e textos iguais.
- S-3602 Densidade: Funil em 1440 px mostra ao menos as mesmas colunas inteiras de antes (3, com colunas de 300 px) e os mesmos cartões.
- S-3603 Nada transborda em 375 px.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-3601–3606 | grep |
| 2 | OP-3602 | navegador 1440 px |
| 3 | todas | navegador com Fernanda e Jurídico |
| 4 | todas | `pnpm lint`, `pnpm test`, `pnpm build` |
