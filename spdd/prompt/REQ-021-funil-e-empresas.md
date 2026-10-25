# REASONS — REQ-021 — Funil e Empresas no novo visual
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-021-funil-e-empresas.md`
**Análise:** `spdd/analysis/REQ-021-funil-e-empresas.md`

## R · Requirements

Cartões que mostram o que importa e lista com ações rápidas, sem mudar as regras do funil.

## E · Entities

- `Modo`: `quadro` | `lista`.

## A · Approach

`TelaEmpresas` carrega empresas (com filtros), usuários e prazos; desenha o quadro (colunas do funil + saídas recolhíveis) ou a tabela. "Mover etapa" abre `PainelLateral` com o `TrocaEtapa` de hoje. Nova empresa continua em `/empresas/nova`.

## S · Structure

- `src/telas/empresas/TelaEmpresas.tsx` (substitui `Funil.tsx` e `Empresas.tsx`)
- `src/telas/empresas/CartaoEmpresa.tsx`
- `src/componentes/ui/componentes.tsx` (`PainelLateral`)
- `src/componentes/Filtros.tsx` (limpar e contagem)
- `src/App.tsx`, `src/estilo.css`

## O · Operations

- **OP-2101 Painel lateral.** Sobreposição à direita, título, fechar (Esc e clique fora), foco no painel.
- **OP-2102 Filtros.** Botão "Limpar filtros" quando há filtro; contagem de resultados.
- **OP-2103 Cartão.** Avatar com iniciais, marca, segmento, `PadraoTag`, avatar do responsável, dias na etapa, pill do prazo; destaques de hoje (sem retorno, resposta vencida, atrasado).
- **OP-2104 Quadro.** Colunas do funil com contagem; "Mostrar saídas" revela Em espera e Recusada; arrastar com as mesmas regras.
- **OP-2105 Lista.** `Tabela` com Marca (avatar), CNPJ, Segmento, Etapa, Padrão, Responsável, Prazo, Ações (Ver, Mover etapa); linhas atrasadas marcadas.
- **OP-2106 Modo e rotas.** Alternância Quadro/Lista lembrada; `/empresas` força Lista; "Nova empresa" na faixa de ações.

## N · Norms

- N-2101 Regras do `CLAUDE.md`; componentes do REQ-018.

## S · Safeguards

- S-2101 Mensagens do REQ-004 inalteradas (S-0401 a S-0405).

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-2103 | navegador |
| 2 | OP-2106 | navegador (recarregar) |
| 3 | OP-2102 | navegador |
| 4 | OP-2104 | navegador |
| 5 | OP-2104 | navegador 375 px |
