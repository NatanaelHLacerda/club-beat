# Análise — REQ-023 — Calendário em visão de semana e de mês
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-023-calendario-semanal.md`

## Resumo

O calendário ganha as visões Semana (grade por horário, padrão ao abrir) e Mês (grade de 7 colunas), com blocos coloridos pela situação e selo nas datas A; o clique abre um painel lateral com as ações de hoje. A visão de ano (cartões e tabela) continua como "Ano".

## Estado atual

- `src/telas/calendario/Calendario.tsx`: ano em cartões, mês em tabela, `AcoesDaData` (reservar, liberar, trocar, apagar), janelas e cadastro [m].
- Regras de reserva no banco e em `src/regras/calendario.ts` (REQ-012) [m].
- Datas têm `horario` em texto "HH:MM" [m].

## Estado desejado

Visões Semana, Mês e Ano; navegação e "Hoje"; no celular, a semana mostra um dia por vez.

## Conceitos e domínio

- Semana de domingo a sábado [d: semente].
- Bloco de 1 hora na hora da aula; sem horário, vai para a faixa "Sem horário" [i].
- Cores: Livre contorno, Reservada Areia com borda dourada, Confirmada Oceano [d].

## Delta

`src/regras/semana.ts` (início da semana, dias, grade do mês, minutos do horário) com testes; componentes `VisaoSemana`, `VisaoMes`, `BlocoData`; tela reorganizada com abas de visão e painel lateral.

## Riscos

- Semana que cruza o ano: carregar os dois anos [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Hoje e selo A | Sim | — |
| 2 Reserva da Fonte Clara | Sim | — |
| 3 Mensagem da janela no painel | Sim | — |
| 4 Um dia por vez no celular | Sim | — |

## Direção recomendada

Grade em CSS (sem biblioteca), posição dos blocos calculada por função pura.

## Decisões pendentes

DP-2301 pela recomendação (abre na semana atual).

## Prontidão para REASONS

Pronto.
