# REQ-010 — Contrato e assinatura
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (cenário D21–D28; documento-base passos 8 e 10, cap. 12)

## Contexto

Depois do aceite, o Jurídico cria a minuta e a Gerente que finaliza coleta a assinatura digital.

## Problema

O contrato pode sair diferente da proposta aceita, ou sem as cláusulas que protegem o Club e o membro.

## Objetivo

Acompanhar a minuta e a assinatura dentro do CRM, com a conferência do cap. 12, e ativar a parceria só com o contrato assinado anexado.

## Atores

Gerente que finaliza, Jurídico.

## Regras de negócio

1. Pacote para o Jurídico: proposta aceita, ficha, razão social, CNPJ, endereço, nome e CPF de quem assina e e-mail da assinatura. O CPF entra só aqui.
2. Tipo de minuta: patrocínio, indústria, serviço ou troca de serviços.
3. Lista de conferência do contrato: partes, objeto e padrão, prazo sem renovação automática, entregas numeradas, valor e pagamento, datas, aprovação de material, fornecedor reserva (consumo), exclusividade ou "não há", o que o Club não promete, privacidade, uso de marca, fim antecipado, responsabilidade, benefício a colaboradores, foro.
4. Prazo do Jurídico: 5 dias úteis mais ajustes. Prazo da assinatura: 2 dias úteis.
5. Diferença entre minuta e proposta volta para a Gerente antes de seguir.
6. Ativar exige: contrato assinado anexado, data de início e de fim e assinatura com duas testemunhas marcada.
7. Ao ativar: datas do calendário passam de "Reservada" para "Confirmada", e Financeiro e Operações recebem a lista de entregas e datas.

## Escopo

### Incluído
- Etapa "Em contrato" com pacote, lista de conferência e anexos (minuta, versões, assinado).
- Botão "Registrar assinatura" que move para Ativa.

### Fora do escopo
- Redação automática da minuta.
- Integração com serviço de assinatura digital.

## Critérios de aceite

1. Dado o pacote sem CPF de quem assina, quando a Gerente envia ao Jurídico, então o CRM recusa e indica o campo.
2. Dado a lista de conferência com "exclusividade" em branco, quando o Jurídico marca "pronto para assinar", então o CRM recusa.
3. Dado o contrato assinado anexado com início 01/12/2026 e fim 30/11/2027, quando a Gerente registra a assinatura, então o card vai para "Ativa" e as datas do calendário viram "Confirmada".
4. Dado a ativação, então Financeiro e Operações recebem aviso com entregas e datas.

## Restrições

—

## Dependências

REQ-008, REQ-009, REQ-012.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-1001` | Quem é o Jurídico (interno ou advogado externo)? | Fernanda confirma |
| `DP-1002` | Minuta-modelo validada por advogado | Jurídico entrega antes do primeiro contrato no CRM |
| `DP-1003` | Prazo acima do qual o Jurídico revisa por completo | Direção define (cap. 12 "… meses") |
