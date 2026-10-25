# REQ-003 — Entrada manual e indicação
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (documento-base passo 1 e "Enquanto o novo formulário não existe")

## Contexto

Empresas também chegam por indicação de membro, funcionário ou Direção, pelo WhatsApp e pelo e-mail interno. A regra é que toda empresa entre pela mesma ficha.

## Problema

Contatos que não passam pelo site ficam fora do registro e sem origem.

## Objetivo

A Isabela cadastra uma empresa à mão, com a mesma ficha do formulário e a origem certa, e o CRM avisa se ela já existe.

## Atores

Isabela, Gerente.

## Regras de negócio

1. Origens: Site, Indicação de membro, Indicação de funcionário, Indicação da Direção, WhatsApp, E-mail, Contato direto.
2. Indicação exige o nome de quem indicou.
3. Na entrada (manual ou pelo site), o CRM busca o CNPJ na base e mostra: parceira ativa, conversa anterior (com situação e motivo) ou contrato perto de renovar.
4. CNPJ que já é parceira ativa não cria empresa nova: o caso abre como conversa de renovação ligada à parceria existente.
5. Na entrada manual, só CNPJ, nome da marca, contato, segmento e origem são obrigatórios; o resto completa na triagem.

## Escopo

### Incluído
- Botão "Nova empresa" com a ficha do formulário.
- Aviso de duplicidade por CNPJ, nas duas entradas.
- Lembrete para avisar quem indicou que o contato foi recebido.

### Fora do escopo
- Leitura automática de e-mails ou WhatsApp.

## Critérios de aceite

1. Dado um cadastro manual com origem "Indicação de membro" sem nome de quem indicou, quando a Isabela salva, então o CRM recusa e destaca o campo.
2. Dado um CNPJ que já teve conversa "Em espera" em março, quando a Isabela digita esse CNPJ, então vê "Já conversou: Em espera desde 03/2026" com o motivo.
3. Dado um CNPJ de parceira ativa, quando chega pelo site, então nenhuma empresa nova é criada e o Gerente responsável recebe aviso.
4. Dado um cadastro manual salvo, então a empresa aparece em "Recebida" com a origem escolhida.

## Restrições

—

## Dependências

REQ-002, REQ-004.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-0301` | Quem avisa quem indicou: a Isabela à mão ou e-mail automático? | À mão, com lembrete no card |
