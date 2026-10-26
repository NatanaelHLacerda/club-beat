# REQ-036 — Telas de trabalho no novo padrão
**Status:** APROVADO — Natanael, 2026-10-26 (*"aprovo e siga até o fim"*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-26 (mesma do REQ-031).

## Contexto
Funil, Empresas (Geral e Recusadas), Ficha da empresa, Minha fila, Direção, Calendário, Operações, Jurídico, Renovações, Painel, Prazos, Avisos e Configuração usam as peças do REQ-018/026–030 com ajustes locais (estilos inline, classes próprias). Depois dos REQ-031 a 033, sobram resíduos do visual antigo.

## Problema
Telas com estilos locais ficariam com pedaços do visual antigo (cantos redondos, pílulas, sombras, Sora) ao lado do novo.

## Objetivo
Varredura das telas de trabalho: tudo passa a usar só os tokens e as peças novas, sem mudar comportamento.

## Atores
Todos os usuários.

## Regras de negócio
1. Nenhum valor de cor, raio, sombra ou fonte fora dos tokens do REQ-031 em `src/telas/**` e `src/estilo.css`.
2. Colunas do quadro do funil tingidas pelo grupo da etapa com a paleta do site (Céu, Sálvia, Areia, Oceano), legíveis em AA.
3. Ficha da empresa: painéis tingidos viram blocos com linha fina e eyebrow; linha do tempo com marcador dourado.
4. Calendário: dia de hoje com traço dourado; reservas em blocos retos.
5. Densidade preservada: tabelas e quadro mostram ao menos o mesmo número de linhas/cartões por tela que hoje em 1440 px.
6. Comportamento, permissões e textos não mudam.

## Escopo
### Incluído
- `src/telas/**`, `src/componentes/*` fora de `ui/`, `src/estilo.css`.
### Fora do escopo
- Novas funções.

## Critérios de aceite
1. Dado uma busca no código por cores hexadecimais, `border-radius` ou `box-shadow` fora dos tokens em `src/telas/**`, então não há resultado.
2. Dado o Funil em 1440 px, então cabem ao menos tantos cartões quanto hoje.
3. Dado cada tela do menu, percorrida com Fernanda (Gerente) e Jurídico, então nada do visual antigo aparece e tudo funciona como antes.
4. Dado `pnpm lint`, `pnpm test` e `pnpm build`, então tudo passa.

## Restrições
Sem dependência nova; sem mudança de banco.

## Dependências
REQ-031, REQ-032, REQ-033.

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-3601` | Dividir em mais de um REQ (funil/empresas, ficha, demais listas)? | Um REQ com uma operação por área; dividir só se a análise mostrar mais de 15 arquivos por área |
