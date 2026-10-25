# REQ-008 — Reunião e proposta
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (cenário D5 a D21; documento-base passos 5 a 7 e cap. 8 e 9)

## Contexto

A Gerente ouve a empresa numa reunião presencial, sem proposta escrita no primeiro encontro. Depois envia a proposta com contrapartidas, datas e valor, e recebe o aceite por escrito.

## Problema

O que foi combinado na reunião, as contrapartidas e o aceite ficam espalhados em WhatsApp e e-mail.

## Objetivo

Registrar agendamento, anotações da reunião, proposta e aceite na empresa, com as contrapartidas tiradas do cardápio do padrão.

## Atores

Gerente que conduz, Operações.

## Regras de negócio

1. Contato da Gerente em até 2 dias úteis após receber o caso; reunião em até 10 dias após o contato.
2. Reunião marcada exige data, hora e local. Lembrete para confirmar no dia anterior.
3. Anotações da reunião: objetivo da empresa, como vão medir o sucesso, quem decide do lado dela, datas de interesse, pedidos além do padrão.
4. Formato da relação: Parceria contínua, Ativação pontual, Evento ou Aula fechada.
5. Tipo: Patrocínio, Parceria com indústria, Parceria de serviço ou Troca de serviços.
6. A proposta só oferece itens do **cardápio do padrão** (cap. 8), nas quantidades máximas dele. Ex.: Bronze até 2 ativações de 1 dia/ano; Prata 4 de 1 dia e 1 de até 3 dias/ano; Ouro 8 de 1 dia, 2 de até 3 dias e 2 grandes de até 4 dias/ano.
7. **Operações confirma** capacidade, equipe, espaço/horário e custo interno antes de a proposta sair.
8. Proposta enviada em até 2 dias úteis após a reunião, com prazo de resposta padrão de 7 dias.
9. Aceite por escrito (e-mail basta) anexado à empresa.
10. Promessa de "rever ao fim do contrato" feita na contraproposta fica registrada e aparece na renovação (REQ-013).
11. Sem acordo após contraproposta: Em espera com motivo e data para retomar (padrão 6 meses).
12. A proposta nunca promete público mínimo, vendas ou retorno financeiro.

## Escopo

### Incluído
- Agendamento e anotações da reunião na ficha.
- Montagem da proposta a partir do cardápio do padrão, com datas do calendário (REQ-012).
- Pedido de confirmação a Operações e registro da resposta.
- Registro de envio, prazo de resposta e aceite.

### Fora do escopo
- Geração de PDF da proposta com layout final.
- Agenda integrada (Google Agenda).

## Critérios de aceite

1. Dado uma empresa Prata, quando a Gerente monta a proposta, então só vê as ofertas do cardápio Prata e não consegue pôr mais de 4 ativações de 1 dia.
2. Dado uma proposta sem confirmação de Operações, quando a Gerente tenta marcar "enviada", então o CRM recusa.
3. Dado uma proposta enviada em 10/11 com prazo de 7 dias, quando chega 17/11 sem aceite, então o card aparece destacado.
4. Dado o aceite anexado de uma empresa Bronze ou Prata dentro do cardápio, então o card vai para "Em contrato".
5. Dado um pedido fora do cardápio, então o card vai para "Com a Direção" (REQ-009) em vez de "Em contrato".

## Restrições

Valores em reais ficam como "R$ …" até a Direção definir.

## Dependências

REQ-006, REQ-007, REQ-012.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-0801` | Valores e quantidades finais de cada padrão | Direção define; o cardápio fica como configuração |
| `DP-0802` | Quantidade de publicações em redes por tempo de contrato | Direção + Gerentes |
| `DP-0803` | Operações confirma pelo CRM ou fora dele? | Pelo CRM, com usuário Operações (DP-0101) |
