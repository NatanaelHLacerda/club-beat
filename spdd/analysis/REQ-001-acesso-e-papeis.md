# Análise — REQ-001 — Acesso e papéis
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-001-acesso-e-papeis.md`

## Resumo

Primeiro REQ do projeto: não há código. Nasce a casca do CRM (login, menu, rotas protegidas), a tabela de perfis com papel e a gestão de usuários pelo administrador.

## Estado atual

- Repositório com Vite + React + TS recém-criado, sem `src/` [m].
- Supabase local rodando com Auth e cadastro público desligado (`supabase/config.toml:176`) [m].

## Estado desejado

Usuário entra com e-mail e senha, vê o menu do CRM e só as ações do seu papel. O administrador (Fernanda, DP-0102) cria usuários e muda papéis. Recuperação de senha pelo e-mail.

## Conceitos e domínio

- **Papel**: 1ª pessoa, Gerente, Direção, Jurídico, Financeiro, Operações [d: cap. 3].
- **Administrador**: atributo do usuário, não papel (DP-0102: Fernanda) [d].
- **Autoria**: toda alteração com autor e data. O registro concreto nasce com a linha do tempo da empresa (REQ-004) [i].

## Delta

- Banco: tipo `papel`, tabela `perfis` ligada a `auth.users`, funções de apoio `meu_papel()` e `sou_admin()` para as RLS dos próximos REQs, `rpc` para mudar papel e disponibilidade.
- Criação de usuário exige a chave de serviço: função de borda (`supabase/functions/usuarios`) que confere se quem chama é administrador.
- Front: cliente Supabase, `api.ts`, `permissoes.ts`, casca com menu lateral, login, redefinir senha, tela de usuários.
- Seed: os sete usuários de exemplo do `CLAUDE.md`.

## Riscos

- Criar usuário pelo navegador vazaria a chave de serviço: por isso a função de borda [i].
- E-mail de recuperação no ambiente local cai no Mailpit (`127.0.0.1:54324`), não numa caixa real [m: config].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Gerente sem "Aprovar" | Sim | o botão nasce no REQ-009; aqui a regra fica em `permissoes.ts` com teste |
| 2 Direção aprova | Parcial | a tela de decisão é do REQ-009; aqui a permissão |
| 3 Sem login vai ao login | Sim | — |
| 4 Histórico com autor | Parcial | linha do tempo nasce no REQ-004 |

## Direção recomendada

Supabase Auth + tabela `perfis` + RLS com funções de apoio; permissões da tela centralizadas; função de borda só para criar usuário. Alternativa descartada: papel no `user_metadata` do Auth (o usuário pode alterar o próprio metadata).

## Decisões pendentes

DP-0101 e DP-0102 decididos pela recomendação da semente: Jurídico, Financeiro e Operações têm usuário; Fernanda é administradora.

## Prontidão para REASONS

Pronto.
