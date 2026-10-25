# REQ-021 — Funil e Empresas no novo visual
**Status:** RASCUNHO
**Origem:** conversa de 2026-10-25 (kit: "Lead Management", "Client Management" com cartões de contato e tabela com ações)

## Contexto

O funil é um quadro de colunas e Empresas é uma tabela simples. O kit mostra cartões de cliente (avatar, nome, empresa, contato) e tabelas com status e ações por ícone.

## Problema

Os cartões do funil mostram pouco e não indicam o que fazer; a lista não tem ações rápidas.

## Objetivo

Funil e Empresas redesenhados com as peças do REQ-018, mantendo as regras do funil (REQ-004) e o arrastar.

## Atores

1ª pessoa, Gerentes, Direção.

## Regras de negócio

1. Cabeçalho de coluna com nome da etapa, contagem e cor discreta; colunas de saída (Em espera, Recusada) recolhidas por padrão.
2. Cartão: avatar com iniciais da marca, marca, segmento, pill do padrão, responsável (avatar pequeno), dias na etapa e a pill do prazo (No prazo / Vence hoje / Atrasado).
3. Alternar entre "Quadro" e "Lista" na mesma tela, guardando a escolha no navegador.
4. Lista: colunas Marca (com avatar), CNPJ, Segmento, Etapa (pill), Padrão (pill), Responsável, Prazo, Ações (ver, mover etapa).
5. Filtros em linha com "Limpar filtros" e contagem de resultados.
6. Regras do REQ-004 inalteradas (motivo nas saídas, Ativa só pela assinatura).

## Escopo

### Incluído
- Telas Funil e Empresas; ação "Mover etapa" a partir da lista, com o mesmo formulário de hoje.

### Fora do escopo
- Novas etapas ou regras.

## Critérios de aceite

1. Dado o Funil, então cada cartão mostra avatar, marca, pill do padrão e a pill do prazo.
2. Dado a escolha "Lista", quando o usuário volta ao Funil outro dia, então a lista aparece de novo.
3. Dado um filtro aplicado, quando clica "Limpar filtros", então todas as empresas voltam e a contagem atualiza.
4. Dado arrastar um cartão para Ativa, então continua aparecendo "A parceria só fica ativa ao registrar a assinatura do contrato."
5. Dado a tela de 375 px, então o quadro rola na horizontal sem estourar a página.

## Restrições

Sem dependência nova.

## Dependências

REQ-018, REQ-019, REQ-004, REQ-014.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-2101` | Empresas e Funil viram uma tela só (quadro/lista)? | Sim; "Empresas" no menu abre a mesma tela em modo lista |
