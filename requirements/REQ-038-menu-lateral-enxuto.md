# REQ-038 — Menu lateral enxuto
**Status:** APROVADO — Natanael, 2026-10-26 (*"aprovo e siga até o fim e realize o push"*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-26 (mesma do REQ-037).

## Contexto
Hoje o menu lateral tem 18 itens: Funil (Início, Funil, Empresas › Geral/Recusadas, Minha fila, Direção), Parcerias (Parcerias ativas, Calendário, Operações, Jurídico, Renovações), Acompanhamento (Painel, Prazos, Avisos) e Configuração (Usuários, Regras e modelos, Importar parceiros, Componentes). Em 900 px de altura o menu rola e os itens de configuração ficam no meio do caminho.

## Problema
Menu longo demais: a pessoa procura o que usa todo dia entre itens que quase nunca abre.

## Objetivo
Menu lateral só com o trabalho do dia a dia, cabendo numa tela de notebook sem rolar.

## Atores
Todos os usuários.

## Regras de negócio
1. Sai do menu lateral o grupo Configuração inteiro (vai para o menu da pessoa, REQ-037).
2. Sai "Avisos" (fica no sino e no menu da pessoa).
3. Ficam três grupos: Funil (Início, Funil, Empresas › Geral/Recusadas, Minha fila, Direção), Parcerias (Parcerias ativas, Calendário, Renovações, Operações, Jurídico) e Acompanhamento (Painel, Prazos).
4. Itens que o papel não abre continuam escondidos (`pode()`).
5. As rotas continuam as mesmas: links salvos e avisos que apontam para `/config/*` e `/avisos` continuam abrindo.
6. Em 1366 × 768, o menu da Gerente cabe sem rolagem.

## Escopo
### Incluído
- `src/componentes/Casca.tsx` (lista de grupos) e estilos do menu.
### Fora do escopo
- Novas telas ou mudança de rota.

## Critérios de aceite
1. Dado qualquer papel, então o menu lateral não mostra Configuração nem Avisos.
2. Dado a Gerente em 1366 × 768, então todos os itens do menu aparecem sem rolar.
3. Dado `/config/usuarios` aberto por link, então a tela abre normalmente para a administradora.
4. Dado o celular, então a gaveta mostra os mesmos três grupos.

## Restrições
Sem dependência nova; sem mudança de banco.

## Dependências
REQ-037 (os itens precisam existir no menu da pessoa antes de saírem do menu lateral).

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-3801` | Juntar Acompanhamento (Painel, Prazos) ao grupo Funil para ficar com dois grupos? | Não: Painel e Prazos são leitura do todo, merecem o próprio grupo |
| `DP-3802` | Mostrar no menu lateral um atalho de "Configuração" para a administradora? | Não: fica só no menu da pessoa |
