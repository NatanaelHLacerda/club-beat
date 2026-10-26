# Análise — REQ-032 — Componentes no padrão do site
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-032-componentes-no-padrao-do-site.md`

## Resumo
Refazer o estilo das peças (`src/componentes/ui`, filtros, rótulos) no padrão do site e juntar num bloco só as regras de peça hoje espalhadas em seis camadas do `estilo.css`.

## Estado atual
- Regras de peça em camadas: "Peças", "Tabelas", "Abas", "Números" (originais), REQ-018, partes do REQ-021 (painel lateral, alternador, filtros), "Área de trabalho", "Estados sem faixa lateral", REQ-026, REQ-027, REQ-028 e as linhas finais [m]. A mesma classe (`.botao`, `.pill`, `.tabela th`) é redefinida até 4 vezes [m].
- Botão principal em pílula com sombra; campos com raio 10; pills redondas; padrão com bolinha; avatar em tons do Oceano antigo `#142540` [m].
- `/config/componentes` mostra números, pills, avatar, busca, tabela, estados e ícones; não mostra botões, campos, alternador nem painel lateral [m].
- Site: botão reto caixa-alta .1em com seta que anda; chip reto ativo em Oceano; campo com rótulo caixa-alta pequena e borda Oceano a 28 %; erro `#8C3B2E` [m].

## Estado desejado
Um bloco "REQ-032: peças" com cada classe de peça definida uma vez; camadas antigas sem regra de peça.

## Conceitos e domínio
Sem entidade. Borda de campo `#8C949E` (3,07:1 sobre branco, atende o contraste de componente de 3:1; a do site, 1,7:1, não atende).

## Delta
- `src/estilo.css`: remove as regras de peça das camadas citadas; acrescenta o bloco REQ-032 (inclui o ritmo de conteúdo que estava no REQ-026).
- `src/componentes/ui/componentes.tsx`: tons do avatar no Oceano do Manual.
- `src/telas/config/Componentes.tsx`: seções Botões, Campos, Alternador e Painel lateral.
- Sem mudança de API.

## Riscos
- Regras de tela com seletor mais específico (`.conteudo-aba .cartao`, `.conteudo-abas .grupos-abas`, `.barra-superior .busca`, `.proximo-passo .botao.primario`) continuam valendo até 033/036 [d].
- Botões em caixa-alta ficam mais largos; barras de ação com muitos botões podem quebrar linha em 1280 px [i]: verificar Funil, Empresas e Ficha.

## Cobertura dos critérios
| Critério | Atendível | Lacuna |
|---|---|---|
| 1 `/config/componentes` | Sim, com as seções novas | — |
| 2 "Nova empresa" | Sim | — |
| 3 erro do campo | Sim (`.msg` + `aria-invalid` já usados pelos formulários) | conferir |
| 4 API | Sim | — |

## Direção recomendada
Reescrever, não sobrepor: tirar as regras de peça das camadas e declarar uma vez.

## Decisões pendentes
DP-3201 na recomendação: ações de linha seguem como ícone com dica.

## Prontidão para REASONS
Pronto.
