# REQ-001 — Acesso e papéis
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprove todas e siga a recomendação. Lembrando que o sistema será feito em react."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (cenário `cenario-crm.html`; documento-base cap. 3 e 9)

## Contexto

O CRM de parcerias é usado por poucas pessoas com responsabilidades bem separadas: a Isabela (1ª pessoa) faz triagens e cuida do cadastro, Fernanda e Marcela são Gerentes de Negócios, a Direção decide Ouro, Master e exceções.

## Problema

Sem papéis, qualquer pessoa pode aprovar o que só a Direção aprova, e o registro de quem fez o quê se perde.

## Objetivo

Entrar no CRM com usuário próprio e enxergar só as ações do seu papel.

## Atores

Isabela (1ª pessoa), Gerente de Negócios, Direção, Jurídico, Financeiro, Marketing/Operações.

## Regras de negócio

1. Papéis: **1ª pessoa**, **Gerente**, **Direção**, **Jurídico**, **Financeiro**, **Operações**.
2. 1ª pessoa: cria e edita empresas, faz triagens, mantém calendário e parcerias ativas.
3. Gerente: tudo da 1ª pessoa, mais conduzir reunião, proposta, assinatura e renovação de Bronze e Prata.
4. Direção: lê tudo e é o único papel que decide os casos que passam pela porta da Direção (REQ-009).
5. Jurídico, Financeiro e Operações: leem as empresas em que foram acionados e registram só a sua parte.
6. Na ausência da Isabela, a Gerente que não conduz o caso cobre as triagens (o papel Gerente já permite).
7. Toda alteração registra autor e data.

## Escopo

### Incluído
- Login com e-mail e senha, sair, recuperar senha.
- Cadastro de usuários e papéis por um administrador.
- Casca do CRM: menu lateral com Funil, Empresas, Parcerias ativas, Calendário, Renovações, Painel.

### Fora do escopo
- Login social ou SSO.
- Permissões configuráveis campo a campo.

## Critérios de aceite

1. Dado um usuário com papel Gerente, quando ele entra, então vê o menu completo e não vê o botão "Aprovar" da Direção.
2. Dado um usuário com papel Direção, quando abre um caso em "Com a Direção", então consegue aprovar, ajustar ou recusar.
3. Dado um usuário sem login, quando abre qualquer página do CRM, então é levado ao login.
4. Dado que a Isabela altera o padrão de uma empresa, então o histórico mostra "Isabela" e a data.

## Restrições

Usuários internos apenas. Nenhum dado de membro do Club entra no CRM.

## Dependências

—

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-0101` | Jurídico, Financeiro e Operações terão usuário ou recebem só aviso por e-mail? | Usuário com acesso de leitura e registro da sua parte |
| `DP-0102` | Quem é o administrador de usuários? | Fernanda |
