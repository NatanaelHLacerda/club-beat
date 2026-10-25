# REQ-013 — Renovação ou encerramento
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (cenário "Renovação" e "−90"; documento-base passo 13)

## Contexto

A renovação nunca é automática: é um novo acordo por escrito, avaliado com o histórico da parceria.

## Problema

Contratos vencem sem ninguém perceber, e a promessa de "rever ao fim" se perde.

## Objetivo

Avisar o Gerente 90 dias antes do fim e conduzir a decisão de renovar igual, renovar com mais benefícios, mudar de padrão ou encerrar.

## Atores

Gerente responsável; Direção para Ouro e Master.

## Regras de negócio

1. A 90 dias do fim a parceria vai para "Em renovação" e o Gerente recebe a mensagem A6. Lembretes aos 60 e 30 dias se nada for decidido.
2. Ficha de avaliação, preenchida a partir dos registros: entregas feitas, pagamentos em dia, notas dos membros, resultados combinados, promessa de revisão registrada (REQ-008).
3. Caminhos: Renovar igual, Renovar com mais benefícios, Mudar de padrão, Encerrar.
4. Bronze e Prata: decide o Gerente. Ouro e Master: Direção (REQ-009).
5. Renovação gera nova proposta e novo contrato, reaproveitando os dados da empresa.
6. Mudar de padrão no meio do contrato só por aditivo com aprovação da Direção; descer de padrão só na renovação.
7. Encerrar: relatório final, retirar marca do site e telas, liberar exclusividade, status "Encerrada".

## Escopo

### Incluído
- Lista "Renovações": contratos que vencem nos próximos 90 dias.
- Ficha de avaliação e registro da decisão.
- Checklist de encerramento.

### Fora do escopo
- Envio do convite A7 por WhatsApp (só modelo para copiar).

## Critérios de aceite

1. Dado um contrato que termina em 30/11/2027, quando chega 01/09/2027, então ele entra em "Em renovação" e o Gerente recebe A6.
2. Dado nenhuma decisão até 01/10/2027, então o Gerente recebe novo lembrete.
3. Dado uma parceria com promessa de revisão registrada, então a ficha de avaliação mostra a promessa no topo.
4. Dado o caminho "Encerrar" concluído, então a exclusividade da categoria fica livre para novas empresas.
5. Dado uma parceria Ouro, quando o Gerente escolhe "Renovar", então o caso vai para a Direção.

## Restrições

Nenhum contrato vence sem aviso (indicador "Contratos vencendo sem aviso = 0").

## Dependências

REQ-011, REQ-009, REQ-015.

## Decisões pendentes

—
