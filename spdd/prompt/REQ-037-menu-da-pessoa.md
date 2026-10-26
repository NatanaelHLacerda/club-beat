# REASONS — REQ-037 — Menu da pessoa
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-037-menu-da-pessoa.md`
**Análise:** `spdd/analysis/REQ-037-menu-da-pessoa.md`

## R · Requirements
Menu do avatar útil: perfil, disponibilidade, avisos, configuração, sair. Fora: tirar itens do menu lateral (038).

## E · Entities
Sem entidade nova. Itens de configuração: Usuários (`gerir_usuarios`), Regras e modelos (todos), Importar parceiros (`editar_empresa`), Componentes (`ver_componentes`).

## A · Approach
Reescrever `MenuUsuario` com a lista de configuração declarada no próprio arquivo e filtrada por `pode()`; disponibilidade por `alterarDisponibilidade(perfil.id, …)` + `recarregar()`; contador por `contarAvisosNaoLidos()` ao abrir e no evento `avisos-mudaram`.

## S · Structure
- `src/componentes/casca/MenuUsuario.tsx`
- `src/estilo.css`

## O · Operations
- **OP-3701 Cabeçalho.** Avatar 40 px, nome, e-mail, papel (+ "administradora").
- **OP-3702 Disponibilidade.** Só `papel === 'gerente'`: botão `role="switch"` com `aria-checked`, rótulo "Disponível para novas empresas" e texto de apoio ("Você entra no revezamento" / "Fora do revezamento"); erro em texto.
- **OP-3703 Avisos.** Link "Meus avisos" para `/avisos` com contador (oculto em 0).
- **OP-3704 Configuração.** Eyebrow "Configuração" e links permitidos; seção some se vazia.
- **OP-3705 Sair.** Último item, separado por linha.
- **OP-3706 Teclado.** Esc fecha e devolve o foco ao avatar; ↑/↓ movem entre itens; abrir pelo teclado foca o primeiro item; clicar num link fecha o menu.

## N · Norms
- N-3701 Permissão só por `pode()`; nenhuma ação nova no banco.

## S · Safeguards
- S-3701 Jurídico, Financeiro e Operações sem interruptor e sem itens que não abrem.
- S-3702 Nada transborda em 375 px.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-3704 | navegador (administradora) |
| 2 | OP-3702 | navegador + `sugerir_gerente()` no banco local |
| 3 | OP-3702, OP-3704 | navegador (Jurídico) |
| 4 | OP-3706 | navegador (teclado) |
| 5 | todas | navegador 375 px |
