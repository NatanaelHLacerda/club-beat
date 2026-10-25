# REQ-005 — Primeira triagem
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (documento-base passo 2, cap. 12 e anexo B)

## Contexto

A primeira triagem confere se há informação suficiente para classificar. Ela não julga se a parceria é boa.

## Problema

Sem roteiro, a conferência depende da memória e empresas incompletas ou de categoria não aceita seguem adiante.

## Objetivo

A Isabela confere cada empresa por uma lista fixa e decide: segue para a Triagem 2, pede informação ou encerra com motivo.

## Atores

Isabela.

## Regras de negócio

1. Lista da Triagem 1: formulário completo, CNPJ válido e ativo, nome e cidade conferem, site/Instagram conferido, portfólio abre, motivo preenchido, consentimento marcado, categoria aceita.
2. Categorias **não aceitas**: tabaco e cigarro eletrônico; apostas e jogos de azar; conteúdo adulto; armas; partidos e campanhas políticas; marcas contrárias ao cuidado com o membro; concorrentes diretos do Club.
3. Categorias **com análise do Jurídico e da Direção**: bebidas alcoólicas; suplementos, medicamentos e procedimentos de saúde/estética; crédito, investimentos e serviços financeiros; produtos para emagrecimento.
4. Categoria não aceita encerra como Recusada com a mensagem A5.
5. Faltou informação: pedido pela mensagem "Pedido de informação" (REQ-015) e prazo de 7 dias. Sem retorno em 7 dias, vai para Em espera.
6. Ao entrar em Triagem 1, a situação na Receita (ativa ou não) e o porte declarado ficam registrados na ficha.
7. Prazo da etapa: 1 dia útil.

## Escopo

### Incluído
- Lista de conferência na ficha, com marcação item a item.
- Seleção de categoria e alerta de categoria não aceita ou sensível.
- Registro do pedido de informação e contagem dos 7 dias.

### Fora do escopo
- Avaliar aderência ao membro (REQ-006).

## Critérios de aceite

1. Dado uma empresa com todos os itens marcados, quando a Isabela conclui, então o card vai para "Triagem 2".
2. Dado o segmento "Apostas", quando a Isabela seleciona a categoria, então o CRM indica "Categoria não aceita" e oferece encerrar com A5.
3. Dado o segmento "Serviços financeiros", então a ficha mostra "Precisa de Jurídico e Direção" e o card pode seguir.
4. Dado um pedido de informação feito em 01/11, quando chega 08/11 sem resposta, então o card aparece destacado para mover a Em espera.
5. Dado a Receita indicando CNPJ "baixado", então a ficha mostra "Empresa inativa" e o item CNPJ não pode ser marcado.

## Restrições

—

## Dependências

REQ-004, REQ-015 (mensagens).

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-0501` | Qual serviço de consulta de CNPJ usar? | Equipe de tecnologia confirma; até lá, conferência manual com link |
| `DP-0502` | Lista de categorias editável pela tela? | Sim, pela Direção |
