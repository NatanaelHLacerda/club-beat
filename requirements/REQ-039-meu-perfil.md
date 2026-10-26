# REQ-039 — Meu perfil
**Status:** APROVADO — Natanael, 2026-10-26 (*"aprovo e siga até o fim e realize o push"*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-26 (*"remova Meus avisos e adicione uma opção que leve a uma feature de perfil, para o usuário realizar modificações em seu perfil"*).

## Contexto
O menu da pessoa (REQ-037) tem "Meus avisos", que repete o sino. Não existe tela de perfil: o nome só muda pela administradora (e hoje nem ela, porque `perfis` não tem `update` liberado: só as rpcs `definir_papel` e `definir_disponibilidade`). A senha só muda pelo "Esqueci a senha", que depende de e-mail, e o projeto ainda não tem provedor de e-mail. A disponibilidade da Gerente já muda pelo menu (REQ-037).

## Problema
A pessoa não consegue ajustar os próprios dados nem trocar a senha de dentro do CRM.

## Objetivo
Tela "Meu perfil" para cada pessoa cuidar dos próprios dados, aberta pelo menu da pessoa.

## Atores
Todos os usuários (cada um só no próprio perfil).

## Regras de negócio
1. Menu da pessoa: sai "Meus avisos"; entra "Meu perfil" (`/perfil`), logo abaixo do cabeçalho.
2. A tela mostra: nome (editável), e-mail (só leitura), papel e "administradora" (só leitura; muda só pela administradora em Usuários), disponibilidade (Gerente; o mesmo interruptor do menu).
3. Nome: obrigatório, 2 a 80 caracteres, sem espaços sobrando; salvo por uma rpc nova `atualizar_meu_nome(nome)` (`security definer`), que só altera a linha de `auth.uid()`. Nada de `update` livre em `perfis`.
4. Trocar senha: senha atual não é pedida pelo Supabase; pedir a nova duas vezes, mínimo 8 caracteres (mesma regra de "Criar nova senha"), por `supabase.auth.updateUser`.
5. Mensagens de sucesso e erro em texto, na própria tela; o nome novo aparece na hora no cabeçalho e no menu.
6. A pessoa não muda papel, e-mail nem o status de administradora pela tela de perfil.

## Escopo
### Incluído
- Migration da rpc `atualizar_meu_nome`; `src/dados/api.ts`; tela `src/telas/perfil/MeuPerfil.tsx`; rota `/perfil`; menu da pessoa; regra pura de validação do nome (com teste).
### Fora do escopo
- Troca de e-mail (depende de provedor de e-mail).
- Foto de perfil.

## Critérios de aceite
1. Dado o menu da pessoa, então não há "Meus avisos" e há "Meu perfil".
2. Dado a Fernanda em "Meu perfil", quando troco o nome e salvo, então o novo nome aparece no cabeçalho e na lista de Usuários.
3. Dado qualquer pessoa, quando chamo `atualizar_meu_nome`, então só o próprio nome muda (teste no banco com outro usuário).
4. Dado a troca de senha com as duas senhas iguais e 8+ caracteres, então consigo sair e entrar com a nova.
5. Dado nome vazio ou senhas diferentes, então aparece o erro em texto e nada é salvo.

## Restrições
Sem dependência nova. Migration nova precisa ser enviada ao projeto hospedado (`supabase db push`) antes do deploy do front.

## Dependências
REQ-001, REQ-037.

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-3901` | O sino continua levando a "Ver todos os avisos"? | Sim: é o único caminho para `/avisos` depois desta mudança |
| `DP-3902` | Mostrar o interruptor de disponibilidade também na tela de perfil, além do menu? | Sim, com o mesmo comportamento |
