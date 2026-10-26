# CRM de Parcerias — Club Beat

CRM do fluxo de parcerias do Club Beat (Fernanda, Gerente de Negócios). Domínio: documento-base `~/Downloads/analise-fernanda.pdf` (v1.0, 22/10/2026) e o cenário `cenario-crm.html`. Requisitos em `requirements/`, SPDD em `spdd/`, perfil em `.claude/spdd-perfil.md`.

## Stack

- React 19 + Vite 8 + TypeScript, React Router 7. Sem biblioteca de UI nem de estado.
- Supabase: Auth (e-mail e senha), Postgres com RLS, Storage (anexos), `pg_cron` (rotina diária).
- Desenvolvimento no Supabase **local** (`supabase start`, Docker). Projeto hospedado e provedor de e-mail ainda não existem.
- Node 20.19+ (`~/.nvm/versions/node/v20.20.2/bin`); o `node` do sistema é 18 e não serve.

## Comandos

```bash
pnpm dev          # http://localhost:5173
pnpm typecheck
pnpm lint
pnpm test         # vitest: regras puras de src/regras
pnpm build
supabase start    # banco local; Studio em http://127.0.0.1:54323 · e-mails locais em http://127.0.0.1:54324
supabase functions serve --no-verify-jwt  # funções de borda (criar usuário)
supabase db reset # recria o banco local a partir de migrations + seed (pede CONFIRM=fernanda no guard)
```

`.env.local` (não versionado): `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` do `supabase status`.

## Arquitetura

```text
supabase/migrations/   uma migration por REQ que mexe em banco (AAAAMMDDHHMMSS_req-XXX-slug.sql)
supabase/seed.sql      usuários e dados de exemplo (marcados como exemplo) + configuração inicial
src/dados/             supabase.ts (cliente) · api.ts (único ponto de acesso a dados) · tipos.ts
src/regras/            regras de negócio puras (porte, pontos, padrão, dias úteis, prazos, calendário) + testes *.test.ts
src/lib/permissoes.ts  o que cada papel pode fazer (única fonte de permissão na tela)
src/componentes/       peças de interface reaproveitadas
src/telas/             uma pasta por área (funil, empresa, parcerias, calendario, renovacoes, painel, publico, config)
src/estilo.css         tokens e estilos
```

## Regras

- Tela não chama o Supabase direto: só `src/dados/api.ts`.
- Regra de negócio fica em `src/regras/` (função pura, com teste). A tela só exibe o resultado.
- O banco garante o que não pode ser burlado: RLS por papel, motivo obrigatório nas saídas, "Ativa" só pela assinatura, decisão da Direção só pelo papel Direção. Essas mudanças passam por funções `rpc` (`security definer`), não por `update` livre.
- Permissão na tela só via `src/lib/permissoes.ts`.
- Dinheiro em centavos inteiros (`*_centavos`), exibido `R$ 1.234,56`. Valor ainda não definido pela Direção aparece "R$ …".
- Datas guardadas em UTC, exibidas em `America/Sao_Paulo`. Prazos contam dias úteis (sem sábado, domingo e `feriados`).
- Dado ausente aparece "—", nunca zero inventado. Dado de exemplo é identificado como exemplo.
- Toda tabela nova tem RLS ligada e `grant` explícito (o Supabase local não concede acesso por padrão).
- Nenhum dado de membro do Club entra no sistema. CPF só no pacote do contrato e nunca em listas.
- E-mail ainda não tem provedor: toda mensagem vai para a tabela `mensagens` (caixa de saída) e aparece na linha do tempo; envio real fica para quando houver provedor.
- Textos da tela em português, simples, no vocabulário do Club (parceiro, membro, ativação, padrão, contrapartida).

## Visual

Menu lateral escuro em Oceano `#0F1D33`→`#16294A` com brilho dourado num canto (ink + brand-glow dos criativos); cabeçalho claro em variações do mesmo Oceano (`#EEF1F7`→`#E2E8F1`, linha `#C9D2E1`, título e ícones Oceano) e área de trabalho clara com a paleta de `~/Downloads/Elementos_de_Marca_para_o_Designer.pdf`: fundo Areia profunda `#ECE3D2`, cartões `#F7F1E6`, sem faixas laterais coloridas, títulos e botão principal Oceano `#142540` (texto claro sobre Oceano), texto `#3B4256`, rótulos e links em Dourado escuro `#7F6024`, Dourado `#D2AE6A` só como detalhe, linhas `#DCCFB5`. Fonte única Sora, a mesma dos criativos da Iris Machine (`skills/iris-machine/design-system.md`), em títulos, números e textos. Peças visuais em `src/componentes/ui` (REQ-018); referência em `/config/componentes`. Cor-sinal por padrão só como detalhe; Master em dourado sobre Oceano. Redesenho das telas pela cadeia REQ-018 a REQ-025.

Refino pelo kit do Figma (REQ-026 a REQ-030, arquivo `jXAbzyaCTYIqPUbejivp1C`): texto 13/14/16/18/24 px; cartões com 20 px de respiro e só a sombra `--sombra-cartao` (sem borda por baixo); blocos dentro de um cartão são painéis tingidos `#EFE6D4`, nunca outro cartão; botão principal em pílula de 44 px; cabeçalho de cartão em faixa (`SecaoCabecalho`); barra de ações numa linha (`Topo secao=…`) com filtros no botão "Filtros"; células de tabela em uma linha (`quebra` para listas, `largo` para colunas que somem); colunas do quadro tingidas por `grupoDaEtapa`.

## Papéis

| Papel | Usuário de exemplo |
|---|---|
| 1ª pessoa | isabela@clubbeat.exemplo |
| Gerente | fernanda@clubbeat.exemplo · marcela@clubbeat.exemplo |
| Direção | direcao@clubbeat.exemplo |
| Jurídico | juridico@clubbeat.exemplo |
| Financeiro | financeiro@clubbeat.exemplo |
| Operações | operacoes@clubbeat.exemplo |

Senha de todos no banco local: ver `supabase/seed.sql`.
