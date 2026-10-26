# Análise — REQ-037 — Menu da pessoa
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-037-menu-da-pessoa.md`

## Resumo
O menu do avatar passa a reunir perfil, disponibilidade (Gerente), avisos, configuração e sair.

## Estado atual
- `src/componentes/casca/MenuUsuario.tsx`: botão com avatar; flutuante com nome, e-mail, papel e "Sair"; fecha ao clicar fora; sem Esc nem setas [m].
- `alterarDisponibilidade(usuario, valor)` em `api.ts` chama `definir_disponibilidade`, que aceita o próprio id (`usuario = auth.uid()`) ou administradora [m].
- `sugerir_gerente()` só considera Gerentes com `disponivel` [m].
- `contarAvisosNaoLidos()` existe; o sino escuta o evento `avisos-mudaram` [m].
- Permissões: `gerir_usuarios` e `ver_componentes` só administradora; `editar_empresa` (Importar) para 1ª pessoa e Gerente; Regras e modelos aberto a todos [m].
- `useSessao().recarregar()` relê o perfil [m].

## Estado desejado
Flutuante com cabeçalho, interruptor (Gerente), "Meus avisos" com contador, seção Configuração filtrada por `pode()`, "Sair"; teclado completo.

## Delta
`MenuUsuario.tsx`, `estilo.css` (bloco REQ-037). Banco: nenhum.

## Riscos
Perfil em memória desatualizado após a troca [m]: chamar `recarregar()`.

## Cobertura dos critérios
| Critério | Atendível |
|---|---|
| 1–5 | Sim |

## Direção recomendada
Padrão "disclosure" (botão `aria-expanded` + lista de links/botões), com setas para mover o foco e Esc para fechar.

## Decisões pendentes
DP-3701 e DP-3702 na recomendação.

## Prontidão para REASONS
Pronto.
