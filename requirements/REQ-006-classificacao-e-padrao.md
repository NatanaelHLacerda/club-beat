# REQ-006 — Segunda triagem: classificação e padrão
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (cenário "Padrão calculado" e "Conflito de categoria"; documento-base cap. 6 e 7, anexo C)

## Contexto

O porte é um fato da empresa; o padrão (Bronze, Prata, Ouro, Master) é decisão do Club. O documento-base define quatro portas: aderência, pontos, investimento e quem aprova.

## Problema

Classificar à mão abre espaço para dar benefício de Ouro a quem investe como Prata.

## Objetivo

A Isabela preenche a ficha de classificação e o CRM calcula porte, pontos e padrão final, aponta conflitos e guarda o estudo da empresa.

## Atores

Isabela; Gerente confirma na reunião.

## Regras de negócio

1. **Porte** pelo faturamento: Pequena (até R$ 4,8 mi, inclui MEI), Média I (R$ 4,8 mi a R$ 90 mi), Média II (R$ 90 mi a R$ 300 mi), Grande (acima de R$ 300 mi).
2. Funcionários conferem o porte (comércio/serviços: até 49 pequena, 50 a 99 média, 100+ grande; indústria: até 99, 100 a 499, 500+). Se divergir, vale o maior porte e a divergência fica anotada.
3. Porte "demais" na Receita impede classificar como Pequena. Marca de grupo ou franquia é classificada pelo grupo. Sem faturamento, porte fica "provisório".
4. **Aderência**: visão compartilhada, hospitalidade, o membro primeiro, longo prazo, viabilidade para o Club, cada um sim / em parte / não. Dois "não", ou "não" em "o membro primeiro", encerram como Recusada.
5. **Pontos**: porte, investimento, duração, força da marca e profundidade das contrapartidas, de 1 a 3 cada. Soma 5–7 Bronze, 8–11 Prata, 12–15 Ouro.
6. **Padrão final = o menor** entre o padrão dos pontos e o padrão da faixa de investimento.
7. Master nunca sai dos pontos: a Isabela só marca "candidata a Master" e o caso vai à Direção.
8. **Conflito**: mesma categoria de parceiro com exclusividade ativa bloqueia, salvo se o contrato dele termina e está marcado para não renovar.
9. **Estudo da empresa**: texto de 6 a 8 linhas obrigatório para sair da etapa.
10. Prazo da etapa: 2 dias úteis.

## Escopo

### Incluído
- Ficha de classificação na empresa, com cálculo automático de porte, pontos e padrão.
- Alerta de conflito de categoria com o nome do parceiro e a data de fim.
- Campo do estudo da empresa.

### Fora do escopo
- Aprovação da Direção (REQ-009).

## Critérios de aceite

1. Dado 60 funcionários em serviços e R$ 3 mi/ano, então o porte fica "Média I" com a nota "divergência: faturamento indica Pequena".
2. Dado pontos 2+2+2+2+2, então a ficha mostra "10 pontos · Prata".
3. Dado pontos 3+2+2+3+3 = 13 e investimento na faixa Prata, então o padrão final é "Prata" com a nota "limitado pelo investimento".
4. Dado "não" em "o membro primeiro", quando a Isabela conclui, então o CRM propõe Recusada com A5.
5. Dado um parceiro ativo com exclusividade em "nutrição e alimentação", quando outra empresa do mesmo segmento é classificada, então aparece o alerta com o nome e o fim do contrato, e o card não segue.
6. Dado o estudo da empresa vazio, quando a Isabela tenta concluir, então o CRM recusa.

## Restrições

Os limites de porte mudam com a lei: ficam como configuração, revisada uma vez por ano.

## Dependências

REQ-005.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-0601` | Valores das faixas de investimento Bronze, Prata e Ouro | Direção define; até lá, a Isabela escolhe a faixa sem valor |
| `DP-0602` | Pequena até R$ 4,8 mi ou R$ 3,6 mi? | R$ 4,8 mi (LC 123), conferindo a vigência |
| `DP-0603` | Viabilidade (Operações) é marcada pela Isabela ou por Operações? | Operações confirma antes da proposta (REQ-008) |
