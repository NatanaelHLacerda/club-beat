# REASONS — REQ-019 — Casca e navegação no estilo do kit
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-019-casca-e-navegacao.md`
**Análise:** `spdd/analysis/REQ-019-casca-e-navegacao.md`

## R · Requirements

Navegação visual e busca global sem sair da tela. Fora: conteúdo das telas.

## E · Entities

- Item de menu: `para`, `rotulo`, `icone`, `acao?`.
- Resultado da busca: `Empresa` (marca, CNPJ, etapa, padrão).

## A · Approach

Grade de duas colunas (lateral + área); a área tem a barra superior fixa (título por portal, busca, sino, usuário) e o conteúdo. Recolher troca a largura da lateral para só ícones. No celular, a lateral vira gaveta sobre o conteúdo com fundo escurecido.

## S · Structure

- `src/componentes/Casca.tsx` (casca, `Topo`, `SemAcesso`)
- `src/componentes/casca/BuscaGlobal.tsx`, `Sino.tsx`, `MenuUsuario.tsx`
- `src/dados/api.ts` (`buscarEmpresas`, `listarAvisosRecentes`)
- `src/telas/empresas/Empresas.tsx` (busca vinda da URL)
- `src/estilo.css`

## O · Operations

- **OP-1901 Menu.** Itens com ícone; ativo com fundo Areia e marcador Oceano; grupos; recolher/expandir lembrado.
- **OP-1902 Barra superior e Topo.** Slot do título; `Topo` desenha eyebrow e título no slot e as ações numa faixa no topo da página.
- **OP-1903 Busca global.** Debounce de 250 ms, até 8 resultados (avatar, marca, CNPJ, etapa), setas e Enter, "Ver todos" → `/empresas?busca=`.
- **OP-1904 Sino.** Contador, lista dos 5 mais recentes, marcar como lido, "Ver todos".
- **OP-1905 Usuário.** Avatar, nome, papel, Sair.
- **OP-1906 Celular.** Botão de menu na barra superior, gaveta e fundo que fecha ao clicar.

## N · Norms

- N-1901 Regras do `CLAUDE.md`; componentes do REQ-018.

## S · Safeguards

- S-1901 Itens sem permissão nunca aparecem.
- S-1902 Busca vazia ou com menos de 2 letras não consulta.

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-1901 | navegador (Isabela) |
| 2 | OP-1903 | navegador |
| 3 | OP-1904 | navegador |
| 4 | OP-1901 | navegador (recarregar) |
| 5 | OP-1906 | navegador 375 px |
