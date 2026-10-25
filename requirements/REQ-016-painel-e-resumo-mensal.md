# REQ-016 — Painel de indicadores e resumo mensal
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (cenário "Renovação e resumo"; documento-base cap. 9 e 13)

## Contexto

O documento-base define poucos indicadores, revisados todo mês, e um resumo mensal das parcerias fechadas para a Direção.

## Problema

Sem números, não se sabe se o funil anda nem se a carteira está equilibrada entre os padrões.

## Objetivo

Um painel com os indicadores do funil, da carteira e da experiência, e um resumo mensal enviado à Direção.

## Atores

Direção, Gerentes.

## Regras de negócio

1. Funil: empresas que chegaram no mês; % respondidas em até 2 dias úteis; % que chegaram à reunião; % de reuniões que viraram contrato; dias entre chegada e contrato; recusadas por não combinar.
2. Carteira: parcerias ativas por padrão; receita mensal de parcerias; % de renovações; % de datas A ocupadas; contratos vencendo sem aviso.
3. Experiência: nota média dos membros nas ativações; satisfação do parceiro; reclamações de membros por trimestre.
4. Cada indicador mostra a meta ao lado quando definida; sem meta, mostra "—".
5. Dado ausente aparece "—", nunca zero inventado.
6. Resumo mensal à Direção no dia 1: parcerias fechadas no mês com padrão e valor, sem pedir aprovação.

## Escopo

### Incluído
- Painel com filtro por mês.
- Cadastro de metas pela Direção.
- Envio do resumo mensal por e-mail.

### Fora do escopo
- Gráficos comparativos de anos anteriores.

## Critérios de aceite

1. Dado 10 empresas recebidas em novembro e 8 respondidas em até 2 dias úteis, então o painel mostra "80%".
2. Dado nenhuma meta cadastrada, então a coluna de meta mostra "—".
3. Dado 3 parcerias fechadas em novembro, então em 01/12 a Direção recebe o resumo com as 3, padrão e valor.

## Restrições

—

## Dependências

REQ-004, REQ-011, REQ-012, REQ-013.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-1601` | Metas de cada indicador | Direção, após 3 meses de uso |
