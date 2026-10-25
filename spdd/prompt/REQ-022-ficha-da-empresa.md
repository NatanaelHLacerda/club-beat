# REASONS — REQ-022 — Ficha da empresa no novo visual
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-022-ficha-da-empresa.md`
**Análise:** `spdd/analysis/REQ-022-ficha-da-empresa.md`

## R · Requirements

Saber, ao abrir a ficha, em que ponto a empresa está e o que fazer agora. Fora: regras das abas.

## E · Entities

- `Passo` (`chave`, `rotulo`, `estado`: `feito` | `atual` | `futuro`).
- `ProximoPasso` (`texto`, `aba`, `prazo?`, `situacao?`).
- Aba: `id`, `titulo`, `grupo` (`empresa`, `triagem`, `negocio`, `parceria`), `papeis?`, `mostrar?`.

## A · Approach

`passosDoCaminho(etapa, passouDirecao)` e `proximoPasso(empresa, prazo)` puros. A ficha carrega o prazo da empresa em `prazos_abertos`. Navegação em dois níveis; o grupo inicial é o da aba padrão da etapa.

## S · Structure

- `src/regras/caminho.ts` + `caminho.test.ts`
- `src/telas/empresa/Ficha.tsx`, `src/telas/empresa/PerfilEmpresa.tsx`
- `src/estilo.css`

## O · Operations

- **OP-2201 Regras.** Passos e estados; saídas (Em espera, Recusada) marcadas como saída; próximo passo por prazo ou por etapa; mapa descrição do prazo → aba.
- **OP-2202 Perfil.** Avatar, marca, razão social, CNPJ, contato (nome, e-mail, WhatsApp com copiar → "Copiado"), padrão, porte, categoria.
- **OP-2203 Caminho.** Linha com marcas nos feitos e o atual em Oceano.
- **OP-2204 Abas em grupos.** Grupos e abas filtrados por papel e por `mostrar`.
- **OP-2205 Próximo passo e mensagens.** Cartão com texto, prazo e botão; cartão Mensagens com "Nova mensagem" que abre o painel lateral (e os atalhos das abas também).

## N · Norms

- N-2201 Componentes do REQ-018; regras do `CLAUDE.md`.

## S · Safeguards

- S-2201 Copiar sem permissão do navegador mostra o número selecionável.

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-2201, OP-2203 | teste + navegador |
| 2 | OP-2201, OP-2205 | teste + navegador |
| 3 | OP-2202 | navegador |
| 4 | OP-2204 | navegador (Jurídico) |
