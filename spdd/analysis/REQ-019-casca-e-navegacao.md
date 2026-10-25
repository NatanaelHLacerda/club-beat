# Análise — REQ-019 — Casca e navegação no estilo do kit
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-019-casca-e-navegacao.md`

## Resumo

Nova casca: barra lateral branca com ícones, recolhível e em gaveta no celular; barra superior com o título da tela, busca global de empresas, sino de avisos e menu do usuário.

## Estado atual

- `src/componentes/Casca.tsx`: menu por grupos só com texto, contador de avisos no item Avisos, botão "Menu" no celular [m].
- Cada tela usa `Topo` para o título e as ações [m].
- `listarEmpresas` já busca por marca, razão social e CNPJ; `listarAvisos`, `contarAvisosNaoLidos`, `marcarAvisoLido` prontos [m].
- Ícones, avatar e busca prontos (REQ-018) [m].

## Estado desejado

Título da tela na barra superior (o `Topo` passa a desenhar ali o título e deixa as ações na página); busca com até 8 resultados; sino com os 5 avisos mais recentes.

## Conceitos e domínio

- Permissões do menu continuam só em `permissoes.ts` [d].
- Escolha "recolhida" lembrada no navegador (`localStorage`, conveniência por pessoa) [d].
- Busca só em empresas (DP-1901) [d].

## Delta

Casca reescrita; `Topo` com portal para a barra superior; `BuscaGlobal`, `Sino`, `MenuUsuario`; `buscarEmpresas(termo)`; Empresas lê `?busca=` da URL.

## Riscos

- Portal depende do elemento da barra existir antes do conteúdo: a casca o cria antes do `Outlet` [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Isabela sem Usuários | Sim | — |
| 2 Busca "verde" | Sim | — |
| 3 Sino 3 → 2 | Sim | — |
| 4 Recolhida lembrada | Sim | — |
| 5 Gaveta a 375 px | Sim | — |

## Direção recomendada

Componentes pequenos dentro da casca, eventos de avisos pelo mesmo `avisos-mudaram` de hoje.

## Decisões pendentes

DP-1901 pela recomendação.

## Prontidão para REASONS

Pronto.
