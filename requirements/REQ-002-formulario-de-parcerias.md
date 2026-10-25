# REQ-002 — Formulário de parcerias
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (cenário "Entrada sem digitação"; documento-base cap. 5)

## Contexto

Hoje o formulário do site tem 5 campos e só abre o WhatsApp com uma mensagem pronta. Nada é guardado. O documento-base define um formulário em 5 blocos que alimenta a primeira triagem.

## Problema

Empresas interessadas não deixam registro, e a Isabela precisa perguntar tudo de novo.

## Objetivo

Toda ficha enviada vira uma empresa no CRM, na etapa "Recebida", com anexos, e a empresa e a Isabela são avisadas.

## Atores

Empresa interessada, Isabela.

## Regras de negócio

1. Cinco blocos, uma tela cada, com "Etapa N de 5": Sobre a empresa, Responsável, Sobre a parceria, Portfólio e materiais, Envio.
2. Obrigatórios: CNPJ, razão social, nome da marca, cidade/UF, segmento, site ou Instagram (pelo menos um), tempo de atuação, faixa de faturamento (com "prefiro informar na reunião"), faixa de funcionários, nome, cargo, WhatsApp, e-mail, o que busca, por que busca o Club, objetivo principal, público da marca, aceite "o envio não é uma proposta", consentimento de privacidade, proteção contra robôs.
3. Faixas de faturamento: até R$ 360 mil; R$ 360 mil a R$ 4,8 mi; R$ 4,8 mi a R$ 90 mi; R$ 90 mi a R$ 300 mi; acima de R$ 300 mi.
4. CNPJ é validado pelo dígito verificador. Razão social e cidade podem vir preenchidas a partir dele.
5. Anexos aceitos: PDF, PPT, PPTX, PNG, JPG, SVG; até 20 MB por arquivo.
6. Não pedir CPF, dados financeiros detalhados, dados sensíveis nem dados de membros.
7. Depois do envio: tela "Recebemos a sua ficha. Nossa equipe responde em até 1 dia útil. Este envio ainda não é uma proposta.", mensagem A1 por e-mail, aviso à Isabela e empresa criada em "Recebida" com origem "Site".
8. Ao final, o formulário pode oferecer o botão do WhatsApp do Club.

## Escopo

### Incluído
- Página pública do formulário, funcionando no celular.
- Gravação da ficha e dos anexos na empresa.
- E-mail A1 e aviso à Isabela.

### Fora do escopo
- Consulta automática à Receita Federal (REQ-005).
- Envio de WhatsApp pela API.

## Critérios de aceite

1. Dado o formulário completo com CNPJ válido, quando a empresa envia, então aparece a tela de confirmação, a empresa surge em "Recebida" com data e origem "Site", e a Isabela recebe aviso.
2. Dado CNPJ "11.111.111/1111-11", quando a empresa tenta avançar, então vê "CNPJ inválido" e não avança.
3. Dado um anexo de 25 MB, quando a empresa envia, então vê "Arquivo acima de 20 MB" e o envio não acontece.
4. Dado o consentimento desmarcado, quando a empresa tenta enviar, então o envio é recusado com o campo destacado.
5. Dado um envio concluído, então o e-mail informado recebe a mensagem A1 com o resumo do que foi enviado.

## Restrições

LGPD: consentimento obrigatório com link para a política de privacidade.

## Dependências

REQ-004 (funil onde a empresa aparece).

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-0201` | Formulário no próprio CRM ou no Cognito Forms enviando para o CRM? | No próprio CRM, para guardar anexos e dados num lugar só |
| `DP-0202` | Faixas de "investimento previsto" (cap. 5) | Aguardar valores da Direção; campo opcional com "ainda não sei" |
| `DP-0203` | Prazo de guarda dos dados do formulário | Definir com o Jurídico; até lá, guardar sem apagar |
| `DP-0204` | Nome exibido: Club Beat ou The Beat Life Club? | Confirmar com a Fernanda |
