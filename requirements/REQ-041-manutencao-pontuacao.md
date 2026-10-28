# REQ-041 — Manutenção / Configurações: pontuação configurável
**Status:** RASCUNHO — aguardando revisão e aprovação humana
**Origem:** pedido de refatoração do CRM (Fernanda, 2026-10-26).

## Contexto
Faixas Bronze/Prata/Ouro (5–7, 8–11, 12–15), pontos de cada opção e faixas de investimento estavam fixos no código (`padraoPorPontos`, `padrao_por_pontos`, `concluir_triagem2`). Mudar exige desenvolvedor e migration.

## Problema
A Direção não consegue ajustar a régua de classificação sem mexer em código.

## Objetivo
Item "Manutenção / Configurações" no menu lateral, com tela para editar cortes de pontos, critérios, pontos de cada opção e faixas de investimento. Nada da pontuação fica fixo.

## Atores
Direção e administrador (editam). Primeira pessoa e Gerente usam a régua na Triagem 2.

## Regras de negócio
1. Os valores de fábrica reproduzem o documento-base (cap. 7): 5–7 Bronze, 8–11 Prata, 12–15 Ouro, abaixo de 5 sem padrão.
2. Cada um dos 5 critérios tem 3 opções; cada opção vale de 0 a 10 pontos, sempre crescendo.
3. Cortes: mínimo ≤ fim do Bronze < fim da Prata < pontuação máxima.
4. Faixas de investimento em centavos, crescentes; vazio = "R$ …".
5. O banco repete a validação (`salvar_config_pontuacao`) e soma os pontos pela configuração em `concluir_triagem2`.
6. A mudança vale para classificações novas; empresas já concluídas mantêm o padrão calculado na época.
7. Configuração ausente ou quebrada cai no padrão de fábrica.

## Escopo
### Incluído
- `parametros` (3 chaves novas), `salvar_config_pontuacao`, `soma_pontos_ficha`, `padrao_por_pontos` configurável
- `src/regras/classificacao.ts` parametrizado + testes
- Tela `/manutencao`, item de menu, permissão `manter_sistema`
- Ficha de pontos da Triagem 2 lendo a configuração
### Fora do escopo
- Limites de porte (faturamento/funcionários) e limiar de aderência.
- Histórico de versões da configuração.

## Critérios de aceite
1. Dado a Direção em Manutenção, quando altera o fim do Bronze e salva, então a próxima classificação usa o novo corte.
2. Dado cortes incoerentes, quando salva, então a tela e o banco recusam com a mensagem do problema.
3. Dado a Gerente, então o item de menu não aparece e `/manutencao` mostra "sem acesso".
4. Dado nenhuma edição, então 5–7/8–11/12–15 continuam valendo.
5. Dado uma empresa já classificada, quando a régua muda, então o padrão dela não muda.

## Restrições
Sem dependência nova. Uma migration.

## Dependências
REQ-006, REQ-038, REQ-001

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-4101` | Quem edita a pontuação? | Direção e administrador (igual a `parametros`) |
| `DP-4102` | Item "Manutenção" volta ao menu lateral, que o REQ-038 enxugou? | Sim, só para quem pode editar (Direção/admin) |
| `DP-4103` | Aplicar a nova régua às classificações já concluídas? | Não: só às novas |
