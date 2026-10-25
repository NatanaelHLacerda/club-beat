# REQ-028 — Tabelas no padrão do kit
**Status:** APROVADO — Natanael, 2026-10-25 (*"aprovo e siga até o fim."*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-25 (kit "CRM Dashboard UI Kit" lido pelo servidor do Figma, arquivo jXAbzyaCTYIqPUbejivp1C)

## Contexto
No kit, o cabeçalho da tabela é uma faixa tingida arredondada, em caixa normal (14 px, 600); as linhas têm cerca de 46 px, uma linha de texto, divisória de 1 px, avatar ao lado do nome e ações em ícones alinhadas à direita.

## Problema
No CRM o cabeçalho é miúdo e em caixa-alta, e as células quebram em duas ou três linhas (data de chegada e "EXEMPLO" embaixo do nome; prazo em duas linhas), deixando as linhas altas e irregulares.

## Objetivo
Tabelas mais limpas e escaneáveis em todas as listas.

## Atores
Todos os usuários.

## Regras de negócio
1. Cabeçalho: faixa `--surface-2`, raio 10 px, caixa normal, 14 px, peso 600.
2. Linha de 48 px; texto em uma linha com reticências; informação secundária vai para dica (title) ou coluna própria.
3. "Exemplo" vira pill pequena ao lado do nome, não linha extra.
4. Prazo mostra só o estado em pill; a data aparece na dica e na ficha.
5. Ações em ícones de 32 px, visíveis sempre, alinhadas à direita.
6. Linha atrasada continua tingida, sem faixa lateral.

## Escopo
### Incluído
- Componente `Tabela` e as telas que o usam.
### Fora do escopo
- Colunas e ordenação (não mudam).

## Critérios de aceite
1. Dado Empresas em Lista com 9 empresas, então todas as linhas têm a mesma altura (48 px).
2. Dado uma empresa de exemplo, então a pill "Exemplo" aparece ao lado da marca na mesma linha.
3. Dado o cabeçalho, então os títulos estão em caixa normal.
4. Dado 375 px, então a tabela rola só dentro do cartão.

## Restrições
Sem dependência nova.

## Dependências
REQ-026, REQ-024.

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-2801` | "Chegou em" sai da coluna Marca? | Vira coluna "Chegada", mostrada quando a tabela tem mais de 1400 px de largura |
