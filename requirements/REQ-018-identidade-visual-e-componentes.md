# REQ-018 — Identidade visual e biblioteca de componentes
**Status:** RASCUNHO
**Origem:** conversa de 2026-10-25 (*"alterar o UI das telas seguindo a ideia desse kit de template"*; kit `CRM Dashboard UI Kit.zip`; `Elementos_de_Marca_para_o_Designer.pdf`)

## Contexto

O tema claro com a paleta da marca já está aplicado nas cores. O kit de referência (Planix, CRM System Dashboard) mostra um padrão limpo: muito espaço em branco, cartões de número com marcador e variação, pills de situação, tabelas com ações por ícone, gráficos simples. O guia de marca define fontes, ícones de traço fino e a regra "dourado só como detalhe".

## Problema

Cada tela monta seus próprios cartões, tabelas e rótulos. Sem peças comuns, o redesenho ficaria diferente de tela para tela.

## Objetivo

Uma biblioteca de peças visuais no estilo do kit, com a identidade do Club, usada por todas as telas das sementes seguintes.

## Atores

Todos os usuários do CRM.

## Regras de negócio

1. Tipografia da marca: **Libre Bodoni** em títulos de página e números de destaque; **Space Grotesk** em textos, tabelas e rótulos.
2. Paleta: Areia `#F4EEE2` (fundo), Areia clara `#FBF8F1` (cartões), Oceano `#142540` (títulos e ação principal), Texto `#3B4256`, Dourado escuro `#7F6024` (rótulos), Dourado `#D2AE6A` só como detalhe, Linha `#DCCFB5`.
3. Ícones de traço fino, em Oceano ou Dourado escuro, sem cores vivas.
4. Cor-sinal do padrão (bronze, prata, ouro, Master) só como detalhe, nunca como fundo inteiro.
5. Peças: cartão de número (marcador dourado à esquerda do rótulo, número grande, variação "vs mês anterior" com seta e cor), pill de situação (etapa, padrão, prazo), tabela com cabeçalho discreto e ações por ícone (ver, editar, excluir quando houver), avatar por iniciais (sem fotos de pessoas), estado vazio, cabeçalho de seção com título e ação "Ver todos".
6. Cantos arredondados de 12 a 16 px nos cartões; sombra suave só em elementos flutuantes.
7. Vocabulário do Club em toda a interface (parceiro, membro, ativação, padrão, contrapartida); nada em inglês.

## Escopo

### Incluído
- Tokens de tipografia, raio, sombra e espaçamento.
- Conjunto de ícones próprio (SVG inline) para menu e ações.
- Componentes: `CartaoNumero`, `Pill`, `Tabela` (com ações), `Avatar`, `SecaoCabecalho`, `Vazio`, `BarraBusca`.
- Página interna de referência dos componentes (só administradora).

### Fora do escopo
- Redesenho das telas (REQ-019 a REQ-025).
- Modo escuro.

## Critérios de aceite

1. Dado qualquer tela do CRM, então os títulos de página aparecem em Libre Bodoni e os textos em Space Grotesk.
2. Dado um cartão de número com valor atual 12 e anterior 10, então mostra "12" e a variação "+20% vs mês anterior" em verde; com anterior 0 ou ausente, mostra "—" no lugar da variação.
3. Dado uma tabela com ações, quando o usuário passa o mouse num ícone, então aparece o nome da ação ("Ver", "Editar"), e o ícone é acessível pelo teclado.
4. Dado o padrão Master numa pill, então ela aparece em dourado sobre Oceano; os demais padrões usam a cor-sinal só no texto ou no marcador.
5. A página de referência mostra todas as peças nos estados carregando, vazio e com dado.

## Restrições

Sem dependência nova de componentes ou ícones (SVG próprio), salvo aprovação. Contraste mínimo AA em texto sobre Areia.

## Dependências

—

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-1801` | Trocar a fonte Sora pelas fontes da marca (Libre Bodoni + Space Grotesk)? | Sim, o guia da marca vale para o CRM |
| `DP-1802` | Biblioteca de ícones pronta (ex.: Lucide) ou SVG próprio? | SVG próprio, ~20 ícones, sem dependência |
| `DP-1803` | Logotipo do Club na barra lateral | Usar o vetor oficial quando o Club enviar; até lá, nome "Club Beat" em Libre Bodoni |
