# Análise — REQ-033 — Casca com a marca do site
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-033-casca-com-a-marca-do-site.md`

## Resumo
Menu lateral Oceano com a logo do site e cabeçalho de tela no tom editorial do site (eyebrow com traço dourado sobre título leve).

## Estado atual
- Logo do site já no topo do menu (REQ-031) [m].
- Regras de casca em três camadas: "Casca (REQ-019)", "Moldura escura" (gradiente com brilho dourado, cabeçalho escuro) e "Cabeçalho claro" (gradiente azul-claro, cores soltas `#EEF1F7`, `#C9D2E1`…) [m].
- `Topo` desenha `h1` e, abaixo, o contexto em dourado; não aceita acento [m].
- No celular, o cabeçalho tem só o botão de abrir a gaveta [m].

## Estado desejado
Uma camada de casca: menu Oceano liso (como as seções escuras do site), grupos em caixa-alta dourada, ativo com traço dourado; cabeçalho branco translúcido com linha fina (como o do site), eyebrow acima do título em 300 e acento opcional; estrela no cabeçalho do celular.

## Delta
- `src/estilo.css`: remover "Casca (REQ-019)", "Moldura escura" (só as regras de casca; "Área de trabalho" e "Estados" ficam para o REQ-036) e "Cabeçalho claro"; bloco "REQ-033: casca".
- `Casca.tsx`: `Topo` com eyebrow antes do título e prop `acento`; estrela no cabeçalho móvel.

## Riscos
- Telas que passam `eyebrow` continuam iguais; o texto vira eyebrow em caixa-alta [m].
- `.lateral` usa `--moldura*` em regras de outras telas? Só a casca [m].

## Cobertura dos critérios
| Critério | Atendível |
|---|---|
| 1 logo branca nítida | Sim (PNG 1481 px servido a 150 px) |
| 2 eyebrow + título | Sim |
| 3 celular com logo e estrela | Sim |

## Direção recomendada
Reescrever a casca num bloco único, com tokens.

## Decisões pendentes
DP-3301 na recomendação: menu Oceano.

## Prontidão para REASONS
Pronto.
