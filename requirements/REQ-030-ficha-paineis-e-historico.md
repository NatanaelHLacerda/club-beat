# REQ-030 — Ficha da empresa: painéis e histórico no padrão do kit
**Status:** APROVADO — Natanael, 2026-10-25 (*"aprovo e siga até o fim."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (kit "CRM Dashboard UI Kit" lido pelo servidor do Figma, arquivo jXAbzyaCTYIqPUbejivp1C)

## Contexto
No detalhe do kit, a coluna da esquerda mostra os dados em painéis tingidos (lista chave–valor, descrição, documento) e um botão principal no pé; a da direita tem abas segmentadas (Atividade, Arquivos, Registro) com a aba ativa em contorno, a linha do tempo e o campo de mensagem fixo embaixo.

## Problema
A ficha do CRM já tem duas colunas (conteúdo e trilho com Próximo passo, Situação, Mensagens e Mudar etapa), mas o perfil mistura ícones, rótulos e valores sem grade, as abas ficam soltas sobre o fundo e o conteúdo das abas vira uma sequência longa de formulários sem respiro.

## Objetivo
Manter a estrutura em duas colunas e trazer do kit: dados em painel chave–valor tingido, abas segmentadas dentro de um cartão e histórico como linha do tempo com campo de anotação fixo.

## Atores
Todos os usuários com acesso à ficha.

## Regras de negócio
1. Perfil: cabeçalho com avatar, marca, pills (padrão, porte, segmento) e, abaixo, painel \`--surface-2\` com grade chave–valor (Razão social, CNPJ, Contato, E-mail, WhatsApp, Segmento, Cidade).
2. Abas segmentadas dentro do cartão de conteúdo, aba ativa em contorno Oceano; os grupos por papel continuam os mesmos.
3. Formulários das abas em blocos com cabeçalho de faixa (REQ-027) e 24 px entre blocos.
4. Aba "Linha do tempo": avatar, autor, ação e data; campo de anotação fixo no pé do cartão.
5. Trilho direito sem mudança de conteúdo; só recebe a escala do REQ-026.

## Escopo
### Incluído
- `Ficha.tsx`, `PerfilEmpresa`, abas.
### Fora do escopo
- Conteúdo e regras de cada aba.

## Critérios de aceite
1. Dado a ficha da Rede Verde, então os dados aparecem em grade chave–valor alinhada dentro de um painel tingido.
2. Dado a aba Linha do tempo, então cada evento mostra avatar, autor e data, e o campo de anotação fica fixo no pé do cartão.
3. Dado 900 px, então a ficha vira uma coluna sem rolagem horizontal.

## Restrições
Sem dependência nova; permissões só via `permissoes.ts`.

## Dependências
REQ-026, REQ-022.

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-3001` | O trilho direito muda? | Não; só a escala |
