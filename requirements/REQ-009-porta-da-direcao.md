# REQ-009 — Porta da Direção
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (cenário "Porta da Direção" e D12–D14; documento-base passo 9 e cap. 9)

## Contexto

O Gerente fecha sozinho Bronze e Prata dentro do cardápio. Ouro, Master e tudo o que foge do estabelecido passam pela Direção.

## Problema

Sem uma trava, uma exceção pode ser prometida sem a Direção saber.

## Objetivo

O CRM detecta quando o caso precisa da Direção, monta o resumo de decisão e só deixa seguir depois da resposta.

## Atores

Gerente, Direção.

## Regras de negócio

1. Vai para "Com a Direção" quando: padrão Ouro ou Master; item fora do cardápio; valor abaixo do mínimo; exclusividade; parceria em que o Club paga; categoria sensível (REQ-005); ou Gerente marcou "parceiro que não pode perder" com justificativa.
2. Resumo de decisão de 1 página, gerado da ficha: empresa, padrão, valor, contrapartidas, datas, riscos e recomendação do Gerente.
3. Respostas da Direção: **Aprovar**, **Ajustar** (com o que mudar) ou **Recusar**, sempre com motivo.
4. Prazo: 3 dias úteis. Passou, novo aviso à Direção e lembrete ao Gerente para informar a empresa do novo prazo.
5. Master: só com vaga livre. Vaga ocupada, a empresa pode entrar como Ouro e ficar na fila do Master.
6. Aprovado volta para o fluxo (Em contrato); Ajustar volta para Em proposta; Recusar vai para Em espera ou Recusada.

## Escopo

### Incluído
- Detecção automática dos motivos e envio do card para "Com a Direção".
- Resumo de decisão e tela de resposta da Direção.
- Controle da vaga Master e fila.

### Fora do escopo
- Assinatura digital da decisão.

## Critérios de aceite

1. Dado uma empresa Prata que pede exclusividade em alimentação, quando a Gerente registra o pedido, então o card vai para "Com a Direção" com o motivo "exclusividade".
2. Dado uma empresa Prata dentro do cardápio, então o card nunca passa por "Com a Direção".
3. Dado uma decisão "Ajustar: reduzir para 2 ativações", então o card volta para "Em proposta" com a nota visível.
4. Dado um caso parado há 3 dias úteis, então a Direção recebe novo aviso e o Gerente recebe lembrete.
5. Dado a vaga Master ocupada, quando outra empresa é marcada candidata a Master, então o CRM oferece "entrar como Ouro e ficar na fila".

## Restrições

Só o papel Direção responde.

## Dependências

REQ-001, REQ-008.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-0901` | Valor mínimo de cada padrão para disparar "abaixo do mínimo" | Vem dos valores da Direção (DP-0801) |
| `DP-0902` | Valor ou pacote da exclusividade | Direção + Operações |
