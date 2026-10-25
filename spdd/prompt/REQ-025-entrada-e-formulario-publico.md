# REASONS — REQ-025 — Entrada e formulário público na identidade do Club
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-025-entrada-e-formulario-publico.md`
**Análise:** `spdd/analysis/REQ-025-entrada-e-formulario-publico.md`

## R · Requirements

A primeira impressão da empresa e da equipe com o tom premium do Club. Fora: fotos.

## E · Entities

Sem entidade nova.

## A · Approach

`MolduraEntrada` (painel Oceano + área do formulário) para login e redefinir senha. `CabecalhoPublico` (faixa Oceano com marca e frase) e `IndicadorEtapas` (números e nomes, feitas com marca) para o formulário e a privacidade.

## S · Structure

- `src/componentes/Moldura.tsx`
- `src/telas/acesso/Entrar.tsx`, `RedefinirSenha.tsx`
- `src/telas/publico/Formulario.tsx`, `Privacidade.tsx`
- `src/estilo.css`

## O · Operations

- **OP-2501 Moldura de entrada.** Duas colunas no computador; no celular, só o formulário com a marca no topo.
- **OP-2502 Cabeçalho público e indicador.** Faixa Oceano; indicador com 5 círculos numerados (feito com marca, atual em Oceano) e nomes.
- **OP-2503 Telas.** Login, redefinir senha, formulário (etapas, campos, botões, confirmação) e privacidade usando as molduras.

## N · Norms

- N-2501 Guia da marca: dourado só em detalhe, frases curtas, sem promessas.

## S · Safeguards

- S-2501 Textos e validações do REQ-002 inalterados.

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-2502 | navegador |
| 2 | OP-2501 | navegador |
| 3 | OP-2501, OP-2503 | navegador 375 px |
| 4 | OP-2503 | navegador |
