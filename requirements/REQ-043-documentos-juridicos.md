# REQ-043 — Jurídico: Minutas Contratuais e Regras de Classificação
**Status:** RASCUNHO — aguardando revisão e aprovação humana
**Origem:** pedido de refatoração do CRM (Fernanda, 2026-10-26).

## Contexto
O Jurídico só tinha a lista de contratos em andamento; modelos de minuta e diretrizes de classificação ficavam fora do sistema.

## Problema
Sem lugar único para os modelos de contrato e para as regras Bronze/Prata/Ouro.

## Objetivo
Duas pastas no módulo Jurídico: "Minutas Contratuais" (guardar e baixar modelos) e "Regras de Classificação (Diretrizes)" (documentos + régua de pontos em vigor).

## Atores
Jurídico e Direção (enviam/apagam); Gerente (lê e baixa).

## Regras de negócio
1. Arquivos PDF, Word, Excel, ODT, TXT, até 20 MB, em bucket privado `juridico`.
2. Download por URL assinada de 5 minutos.
3. Ler: Jurídico, Gerente, Direção. Enviar/apagar: Jurídico e Direção. RLS no banco e no storage.
4. A pasta de Diretrizes exibe os pontos e faixas atuais (REQ-041) ao lado dos documentos.

## Escopo
### Incluído
- Tabela `documentos_juridicos` + bucket + políticas
- `PastaDocumentos.tsx`, abas em `Juridico.tsx`
- Permissão `gerir_documentos_juridicos`
### Fora do escopo
- Versionamento de minutas.
- Geração automática de contrato a partir da minuta.

## Critérios de aceite
1. Dado o Jurídico, quando envia uma minuta, então ela aparece na pasta e pode ser baixada.
2. Dado a Gerente, então vê e baixa, mas não vê enviar/apagar.
3. Dado um papel sem acesso ao Jurídico, então não lê tabela nem arquivo.
4. Dado a pasta Diretrizes, então mostra os cortes e pontos atuais.

## Restrições
Sem dependência nova. Uma migration.

## Dependências
REQ-011, REQ-041

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-4301` | Primeira pessoa pode ler as diretrizes? | Não nesta entrega (ver_juridico: Jurídico, Gerente, Direção) |
| `DP-4302` | Direção também envia documentos? | Sim |
