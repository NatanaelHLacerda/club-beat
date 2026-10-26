# REQ-037 — Menu da pessoa
**Status:** APROVADO — Natanael, 2026-10-26 (*"aprovo e siga até o fim e realize o push"*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-26 (*"enxugar o menu lateral enviando opções [para] o dropdown que está sendo praticamente inutilizável"*).

## Contexto
O menu que abre no avatar (canto superior direito, `MenuUsuario`, REQ-019) mostra só nome, e-mail, papel e "Sair". O menu lateral tem 18 itens em quatro grupos (Funil, Parcerias, Acompanhamento, Configuração), e os do grupo Configuração (Usuários, Regras e modelos, Importar parceiros, Componentes) são usados raramente e só por quem administra. "Avisos" também está no menu lateral, embora o sino já abra os avisos e leve a "Ver todos os avisos". A disponibilidade da Gerente para receber empresas novas (REQ-007) só muda pela tela de Usuários, que só a administradora abre, apesar de o banco já deixar cada pessoa mudar a própria (`definir_disponibilidade`).

## Problema
O menu da pessoa ocupa um lugar nobre da tela e quase não serve para nada; ao mesmo tempo, o menu lateral carrega itens de configuração que poluem o trabalho do dia a dia.

## Objetivo
Transformar o menu da pessoa no lugar das coisas "minhas" e de configuração: perfil, disponibilidade, avisos, configurações do CRM e sair.

## Atores
Todos os usuários; administradora e Direção para os itens de configuração.

## Regras de negócio
1. Cabeçalho do menu: avatar, nome, e-mail, papel (e "administradora" quando for).
2. "Disponível para novas empresas": interruptor só para Gerente, ligado ao próprio perfil (`definir_disponibilidade` com o próprio id); mostra o estado atual e confirma a troca com uma mensagem curta.
3. "Meus avisos": leva a `/avisos`, com o número de não lidos.
4. Seção "Configuração", só com o que a pessoa pode abrir (`src/lib/permissoes.ts`): Usuários, Regras e modelos, Importar parceiros, Componentes.
5. "Sair" por último, separado por linha.
6. O menu abre e fecha pelo teclado (Enter/Espaço no avatar, Esc fecha e devolve o foco), com navegação por setas entre os itens; cada item é um link ou botão de verdade.
7. Nenhuma permissão nova: o menu só mostra o que `pode()` já libera.

## Escopo
### Incluído
- `src/componentes/casca/MenuUsuario.tsx`, estilos do menu, `src/dados/api.ts` (reuso de `alterarDisponibilidade` e contagem de avisos).
### Fora do escopo
- Tela de perfil ou troca de senha dentro do CRM.
- Tirar os itens do menu lateral (REQ-038).

## Critérios de aceite
1. Dado a administradora, quando abro o menu da pessoa, então vejo Usuários, Regras e modelos, Importar parceiros e Componentes na seção Configuração.
2. Dado uma Gerente, quando desligo "Disponível para novas empresas", então ela deixa de ser sugerida na distribuição (REQ-007) e o menu mostra o novo estado.
3. Dado o Jurídico, então o menu não mostra o interruptor nem itens de configuração que ele não abre.
4. Dado só o teclado, então consigo abrir o menu, chegar a cada item e fechá-lo com Esc.
5. Dado o celular (375 px), então o menu cabe na tela sem rolagem lateral.

## Restrições
Sem dependência nova; sem mudança de banco. Visual do design system do site (REQ-031 a 036).

## Dependências
REQ-007, REQ-019, REQ-033.

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-3701` | "Regras e modelos" vai para o menu da pessoa mesmo sendo aberto por todos? | Sim: é consulta e configuração, não trabalho do dia |
| `DP-3702` | O interruptor de disponibilidade aparece também para a 1ª pessoa? | Não: a distribuição (REQ-007) só considera Gerentes |
