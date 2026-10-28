# REQ-042 — Quem decide a parceria (Triagem 1 → Triagem 2)
**Status:** RASCUNHO — aguardando revisão e aprovação humana
**Origem:** pedido de refatoração do CRM (Fernanda, 2026-10-26).

## Contexto
O campo `quem_decide` (eu mesmo / outra pessoa) era opcional e, quando "outra pessoa", não havia onde registrar quem é. A Triagem 2 não mostra os dados da Triagem 1.

## Problema
O decisor real da parceria fica desconhecido e a Triagem 2 obriga a abrir outras abas para conferir empresa, porte e responsável.

## Objetivo
Pergunta "Quem decide a parceria?" com campos condicionais obrigatórios (nome completo, e-mail, telefone/WhatsApp do decisor) e Triagem 2 exibindo os dados consolidados da Triagem 1 sem redigitar.

## Atores
Empresa (formulário público), Primeira pessoa e Gerente (entrada manual, triagens).

## Regras de negócio
1. "Eu mesmo": o decisor é o próprio responsável; nada extra é pedido.
2. "Outra pessoa": nome, e-mail e WhatsApp do decisor são obrigatórios (formulário público, Nova empresa, Resumo da ficha e banco).
3. No formulário público e na entrada nova a resposta é obrigatória; empresas antigas sem resposta seguem como estão.
4. Empresa com "outra pessoa" e dados incompletos não passa para a Triagem 2 (`requisitos_triagem2`).
5. Trocar para "eu mesmo" limpa os dados do decisor.
6. A Triagem 2 mostra empresa, porte, responsável e decisor a partir da própria ficha.

## Escopo
### Incluído
- Colunas `decisor_*`, gatilho `exigir_decisor`, `enviar_ficha`, `requisitos_triagem2`
- `src/regras/decisor.ts`(+test)
- Formulário público, Nova empresa, Resumo, aviso na Triagem 1, painel "Dados da Triagem 1"
### Fora do escopo
- Notificar o decisor por e-mail/WhatsApp.
- Cadastro de vários decisores.

## Critérios de aceite
1. Dado o formulário público, quando escolhe "Outra pessoa", então nome, e-mail e WhatsApp do decisor passam a ser obrigatórios.
2. Dado "Eu mesmo", então nenhum campo extra aparece.
3. Dado uma empresa com "outra pessoa" sem dados, quando tenta ir para a Triagem 2, então o sistema bloqueia e aponta o Resumo.
4. Dado a Triagem 2, então empresa, porte, responsável e decisor aparecem sem redigitar.

## Restrições
Sem dependência nova. Uma migration.

## Dependências
REQ-002, REQ-003, REQ-005, REQ-006

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-4201` | Empresas antigas com "outra pessoa" e sem dados ficam bloqueadas até preencher? | Sim, só na passagem para a Triagem 2 |
| `DP-4202` | "Quem decide" é obrigatório na entrada manual? | Não: a entrada manual segue mínima; só exige os dados quando marcar "outra pessoa" |
