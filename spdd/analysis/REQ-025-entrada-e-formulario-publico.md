# Análise — REQ-025 — Entrada e formulário público na identidade do Club
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-025-entrada-e-formulario-publico.md`

## Resumo

Login e redefinir senha em duas metades (Oceano com a marca + formulário); formulário público e política de privacidade com faixa Oceano, indicador das 5 etapas com nome e número, e confirmação elegante. Regras do REQ-002 inalteradas.

## Estado atual

- `src/telas/acesso/Entrar.tsx` e `RedefinirSenha.tsx`: cartão centralizado [m].
- `src/telas/publico/Formulario.tsx`: "Etapa N de 5" com barra de progresso; `Privacidade.tsx` com o mesmo cabeçalho [m].
- Fontes e cores da marca aplicadas (REQ-018) [m].

## Estado desejado

Tom premium do guia: muito espaço, Oceano e Areia, dourado só em detalhe, frases curtas.

## Conceitos e domínio

- Frase do vocabulário do Club: curadoria, "o membro primeiro" [d: guia].
- Sem fotos até haver autorização (DP-2501) [d].

## Delta

Componente `MolduraEntrada` para login e senha; `CabecalhoPublico` e `IndicadorEtapas` para as páginas públicas; estilos.

## Riscos

Nenhum: só visual [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Etapas 1 e 2 concluídas na 3 | Sim | — |
| 2 Metade Oceano no login | Sim | — |
| 3 375 px | Sim | — |
| 4 "CNPJ inválido" | Sim | — |

## Direção recomendada

Componentes de moldura reaproveitados pelas quatro páginas.

## Decisões pendentes

DP-2501 pela recomendação (sem foto; faixa Oceano com detalhe dourado).

## Prontidão para REASONS

Pronto.
