# Análise — REQ-039 — Meu perfil
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-039-meu-perfil.md`

## Resumo
Tela `/perfil` com nome editável (rpc nova), dados só de leitura, disponibilidade da Gerente e troca de senha; "Meu perfil" no lugar de "Meus avisos" no menu da pessoa.

## Estado atual
- `perfis`: RLS com `select` para autenticados; sem política nem grant de `update` para `authenticated` (REQ-001 e migration de permissões do hospedado) [m].
- `definirNovaSenha(senha)` em `api.ts` usa `supabase.auth.updateUser({ password })`; mensagem de erro fala em "link" (pensada para a redefinição por e-mail) [m].
- `alterarDisponibilidade` e o interruptor já existem (REQ-037) [m].
- `useSessao().recarregar()` relê o perfil; o cabeçalho e o menu leem do contexto [m].
- Migrations novas: o hospedado nega `EXECUTE` a `PUBLIC` e dá `EXECUTE` a `authenticated` por padrão (migration de permissões) [m].
- Regra do nome não existe; a de senha (8+, iguais) está solta em `RedefinirSenha.tsx` [m].

## Estado desejado
- rpc `atualizar_meu_nome(novo_nome text)`: `security definer`, `search_path` fixo, normaliza espaços, valida 2–80, atualiza só `id = auth.uid()` e `ativo`; `revoke` de `anon`, `grant` a `authenticated`.
- `src/regras/perfil.ts`: `normalizarNome`, `erroNome`, `erroNovaSenha` (+ testes).
- Tela `MeuPerfil` e rota `/perfil`.

## Delta
Migration `20261026010000_req-039-meu-perfil.sql`; `api.ts` (`atualizarMeuNome`, `trocarMinhaSenha`); `regras/perfil.ts`; `telas/perfil/MeuPerfil.tsx`; `App.tsx`; `MenuUsuario.tsx`; `estilo.css`.

## Riscos
- Front publicado antes da migration no hospedado quebra só o salvar do nome [m]: aplicar a migration no hospedado antes do push do código.
- Nome dos perfis de exemplo perde o sufixo "(exemplo)" se a pessoa editar [i]: aceitável; perfis de exemplo só existem no banco local.

## Cobertura dos critérios
| Critério | Atendível |
|---|---|
| 1–5 | Sim |

## Direção recomendada
Rpc pequena no banco + regra pura reaproveitada na tela.

## Decisões pendentes
DP-3901 e DP-3902 na recomendação.

## Prontidão para REASONS
Pronto.
