# REQ-019 — Casca e navegação no estilo do kit
**Status:** APROVADO — Natanael, 2026-10-25, segue a cadeia (*"aprovo todas. Siga do inicio ao fim da implementação do SPDD"*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (kit de referência: barra lateral clara com ícones, barra superior com busca, avisos e usuário)

## Contexto

Hoje o menu lateral é uma lista de textos por grupo, e cada tela tem só um título. No kit, a barra lateral tem logotipo, ícones e item ativo em destaque, e a barra superior traz o título da tela, a busca, o sino de avisos e o usuário.

## Problema

Navegação pouco visual e sem busca global: para achar uma empresa é preciso abrir a lista de Empresas.

## Objetivo

Casca nova: barra lateral com ícones e grupos, barra superior com título, busca global por empresa, sino de avisos com contador e menu do usuário.

## Atores

Todos os usuários do CRM.

## Regras de negócio

1. Barra lateral branca: marca do Club no topo, itens com ícone e rótulo, item ativo com fundo Areia e marcador Oceano; grupos (Funil, Parcerias, Acompanhamento, Configuração) mantidos.
2. Itens que o papel não pode usar continuam escondidos (`permissoes.ts`).
3. Barra superior: título da tela (Libre Bodoni) e linha de contexto; busca por marca, razão social ou CNPJ com resultados enquanto digita (até 8) e "Ver todos" que abre Empresas filtrada.
4. Sino com o número de avisos não lidos e lista dos 5 mais recentes; "Ver todos" leva a Avisos.
5. Menu do usuário: avatar por iniciais, nome, papel, "Sair".
6. Barra lateral recolhível no computador (só ícones) e menu em gaveta no celular.

## Escopo

### Incluído
- Novo componente de casca, barra superior, busca global, painel do sino, menu do usuário.

### Fora do escopo
- Conteúdo das telas.

## Critérios de aceite

1. Dado a Isabela logada, então a barra lateral não mostra "Usuários" e mostra "Funil" com ícone.
2. Dado que o usuário digita "verde" na busca, então aparece "Rede Verde" na lista e Enter abre a ficha.
3. Dado 3 avisos não lidos, então o sino mostra "3"; ao abrir e marcar um como lido, mostra "2".
4. Dado a barra lateral recolhida, então só os ícones aparecem, com o nome no passar do mouse, e a escolha fica lembrada no navegador.
5. Dado a tela de 375 px, então a barra lateral vira gaveta aberta pelo botão de menu.

## Restrições

Sem dependência nova.

## Dependências

REQ-018.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-1901` | A busca global procura também em parcerias e calendário? | Só empresas nesta etapa |
