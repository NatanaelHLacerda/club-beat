# Análise — REQ-007 — Distribuição entre Gerentes e passagem de bastão
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-007-distribuicao-e-passagem.md`

## Resumo

Depois da Triagem 2, o CRM sugere a Gerente pelo revezamento; a Isabela confirma ou troca (com motivo) e passa o caso: a empresa recebe a A2 com o nome da Gerente e a Gerente recebe aviso. Para pôr uma segunda Gerente no caso, a ficha de passagem é obrigatória. Cada Gerente vê a sua fila ordenada por padrão.

## Estado atual

- `empresas.gerente1_id`, `gerente2_id`, `responsavel_id` existem (`20261025000400_req-004-funil.sql`) [m].
- `perfis.disponivel` existe e a tela de usuários alterna (`20261025000100_req-001-acesso.sql`) [m].
- `triagem2_concluida_em` e `requisitos_reuniao` (`20261025002300_req-006-classificacao.sql`) [m].
- `enviar_modelo_automatico` e `avisar_usuario` prontos [m].

## Estado desejado

Botão "Passar à Gerente" com a sugestão do revezamento; fila "Minha fila"; ficha de passagem na ficha da empresa.

## Conceitos e domínio

- **Revezamento**: alterna entre Gerentes disponíveis, pela ordem das passagens [d: cap. 3].
- **Troca por disponibilidade** com motivo [d].
- **A2 na passagem**: o critério 4 pede que a empresa receba a A2; aqui ela sai sozinha na passagem, além de A1 e A6 [d: REQ-007 é mais específico que a regra 4 do REQ-015].
- **Ficha de passagem** (anexo C): o que a empresa busca, o que o Club apresentou, o que pediu a mais, o que se prometeu rever, datas, se precisa da Direção, prazo de retorno, responsável final [d].
- **Ordem da fila**: Master/candidata e Ouro primeiro, depois Prata, depois Bronze [d].

## Delta

Banco: colunas `passada_em`, `passagem` (jsonb); `sugerir_gerente()`, `passar_a_gerente(empresa, gerente, motivo)`, `definir_gerente2(empresa, gerente, ficha)`; `requisitos_reuniao` passa a exigir Gerente. Front: aba "Gerentes", tela "Minha fila", item de menu.

## Riscos

- Duas passagens simultâneas podem cair na mesma Gerente: a sugestão é recalculada dentro da função, com bloqueio da linha [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Revezamento | Sim | — |
| 2 Indisponível | Sim | — |
| 3 Gerente 2 sem ficha | Sim | — |
| 4 A2 e aviso | Sim | A2 na caixa de saída (sem provedor de e-mail) |

## Direção recomendada

Revezamento calculado a partir da última passagem (sem estado extra); ficha de passagem como JSON na empresa; responsável final sempre preenchido.

## Decisões pendentes

DP-0701 (limite por Gerente) fica para a Direção; sem limite até lá.

## Prontidão para REASONS

Pronto.
