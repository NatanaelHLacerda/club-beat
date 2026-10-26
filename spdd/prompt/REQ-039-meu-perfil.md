# REASONS — REQ-039 — Meu perfil
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-039-meu-perfil.md`
**Análise:** `spdd/analysis/REQ-039-meu-perfil.md`

## R · Requirements
Cada pessoa edita o próprio nome, troca a própria senha e (Gerente) a disponibilidade, em `/perfil`. Fora: e-mail e foto.

## E · Entities
- `atualizar_meu_nome(novo_nome text) returns void` — só a linha de `auth.uid()`; erro "Informe um nome de 2 a 80 caracteres."
- `normalizarNome(v)`: apara e junta espaços. `erroNome(v)`: `null` ou mensagem. `erroNovaSenha(senha, confirma)`: `null` ou mensagem (8+, iguais).

## A · Approach
Rpc `security definer` como as demais mudanças de perfil; regra pura usada pela tela e pela redefinição de senha.

## S · Structure
- `supabase/migrations/20261026010000_req-039-meu-perfil.sql`
- `src/regras/perfil.ts` (+ `perfil.test.ts`)
- `src/dados/api.ts`
- `src/telas/perfil/MeuPerfil.tsx`, `src/App.tsx`
- `src/componentes/casca/MenuUsuario.tsx`, `src/telas/acesso/RedefinirSenha.tsx`
- `src/estilo.css`

## O · Operations
- **OP-3901 Migration.** Função, `revoke` de `public`/`anon`, `grant` a `authenticated`.
- **OP-3902 Regras.** Funções puras e testes (vazio, 1 caractere, 81, espaços, senhas curtas/diferentes).
- **OP-3903 API.** `atualizarMeuNome(nome)` e `trocarMinhaSenha(senha)` com mensagens em português.
- **OP-3904 Tela.** `Topo` "Meu *perfil*"; cartão "Dados" (nome editável + salvar; e-mail, papel, administradora em leitura); cartão "Disponibilidade" (Gerente); cartão "Senha" (nova + repetir); sucesso/erro em texto com `role="status"`/`role="alert"`; após salvar o nome, `recarregar()`.
- **OP-3905 Menu.** "Meu perfil" no lugar de "Meus avisos" (sem contador).
- **OP-3906 Redefinir senha.** Usa `erroNovaSenha`.

## N · Norms
- N-3901 Nada de `update` livre em `perfis`; mudança só por rpc.

## S · Safeguards
- S-3901 Papel, e-mail e administradora não mudam pela tela.
- S-3902 Rpc chamada por um usuário não altera outro (teste no banco local).

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-3905 | navegador |
| 2 | OP-3903, OP-3904 | navegador + Usuários |
| 3 | OP-3901 | `supabase/testar.sh` |
| 4 | OP-3903, OP-3904 | navegador: sair e entrar |
| 5 | OP-3902, OP-3904 | testes + navegador |
