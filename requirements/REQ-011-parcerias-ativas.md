# REQ-011 — Parcerias ativas e acompanhamento
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (cenário "Ativa"; documento-base passos 11 e 12, cap. 11)

## Contexto

Com o contrato assinado, a parceria precisa ter as entregas feitas, os relatórios enviados e o balanço trimestral, para sustentar a renovação.

## Problema

Hoje não se sabe quanto de cada entrega já foi feito nem quando foi o último relatório.

## Objetivo

Uma lista de parcerias ativas com o contratado e o entregue lado a lado, relatórios e balanços com prazo.

## Atores

Gerente responsável, Isabela, Marketing/Operações.

## Regras de negócio

1. Registro da parceria: empresa, CNPJ, contato, segmento, porte, padrão, tipo, início, fim, contrapartidas, exclusividade (categoria e período), datas de eventos, responsável e valor (R$ … ou "troca de serviços").
2. Entregas contratadas x feitas: telas, publicações, ativações, eventos. Cada entrega feita tem data e fotos/registros anexados.
3. Medidas e regras do material informadas à empresa em até 10 dias da assinatura; ações começam em até 30 dias.
4. Material da marca precisa de aprovação do Club antes de ir ao ar; aprovação ou recusa com motivo.
5. Relatório: Ouro e Master todo mês até o dia 10; Bronze e Prata um resumo a cada 3 meses.
6. Balanço com a empresa a cada 3 meses, com os resultados combinados na reunião.
7. Opinião dos membros (nota de 1 a 5) registrada por ativação, sem identificar membros.
8. Antes de cada ativação: equipe do parceiro orientada sobre privacidade (marcação obrigatória).
9. Limites do mês: no máximo um tipo de ação e 4 dias de ação.

## Escopo

### Incluído
- Lista "Parcerias ativas" com padrão, fim do contrato, entregas (feito/contratado), próximo relatório.
- Ficha da parceria com entregas, aprovações de material, relatórios, balanços e notas dos membros.
- Lembretes de relatório e balanço.

### Fora do escopo
- Geração automática do relatório em PDF.

## Critérios de aceite

1. Dado uma parceria Prata com 4 ativações contratadas e 1 feita, então a lista mostra "Ativações 1/4".
2. Dado uma parceria Ouro, quando chega o dia 11 sem relatório do mês anterior, então ela aparece como "relatório atrasado".
3. Dado uma ativação sem a marcação de orientação de privacidade, quando alguém registra a ativação como feita, então o CRM recusa.
4. Dado uma segunda ação de tipo diferente no mesmo mês, então o CRM avisa que passa do limite mensal.

## Restrições

Nenhum registro guarda imagem, som, contato ou dado de membro.

## Dependências

REQ-010.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-1101` | Limites mensais valem por parceiro ou para o Club todo? | Para o Club todo (proteger o membro) |
