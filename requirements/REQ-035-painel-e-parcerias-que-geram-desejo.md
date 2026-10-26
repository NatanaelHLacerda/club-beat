# REQ-035 — Painel e parcerias que geram desejo
**Status:** APROVADO — Natanael, 2026-10-26 (*"aprovo e siga até o fim"*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-26 (*"o CRM precisa gerar desejo"*).

## Contexto
O Início (REQ-020) e Parcerias ativas (REQ-011/024) mostram números, listas e alertas em cartões iguais. No site, os números aparecem grandes e leves ("Desde 2019, em movimento"), e as marcas parceiras ganham presença com foto e contexto.

## Problema
Dentro do CRM, o trabalho com marcas de alto padrão parece uma planilha; nada lembra o que a parceria entrega ao membro nem dá orgulho do portfólio.

## Objetivo
Trazer o tom do site para as telas de leitura: o Início abre com uma faixa editorial e números de destaque; Parcerias ativas vira uma vitrine das marcas.

## Atores
Gerente, Direção, 1ª pessoa.

## Regras de negócio
1. Início: faixa de abertura em Oceano com saudação editorial (nome da pessoa, acento itálico), a data e até 3 números grandes leves (parcerias ativas, empresas no funil, prazos de hoje). Abaixo, o conteúdo atual com os componentes do REQ-032.
2. Parcerias ativas ganha a visão "Vitrine": cartões com o logotipo da marca (anexo do tipo `logotipo`, quando existir e o contrato permitir), padrão (Master em Dourado sobre Oceano), período e próxima entrega; sem logotipo, as iniciais em tipografia editorial. A lista atual continua como alternativa.
3. Logotipo de parceira só aparece com parceria ativa (contrato assinado), conforme a regra do formulário ("Logotipo só será usado depois do acordo").
4. Números sem dado aparecem "—", nunca zero inventado; dado de exemplo marcado como exemplo.

## Escopo
### Incluído
- `src/telas/inicio` (Início), `src/telas/parcerias`, leitura de anexos `logotipo` via `src/dados/api.ts` (URL assinada do Storage).
### Fora do escopo
- Novos indicadores (REQ-016).

## Critérios de aceite
1. Dado o Início, então a primeira dobra mostra a faixa editorial com o nome da pessoa e até 3 números grandes.
2. Dado Parcerias ativas, quando escolho "Vitrine", então cada parceria aparece como cartão com logotipo ou iniciais, padrão e período.
3. Dado uma empresa que não está ativa, então o logotipo dela não aparece em nenhuma vitrine.
4. Dado o papel Jurídico, então a vitrine respeita o que o papel pode ler (RLS).

## Restrições
Sem dependência nova; sem mudança de banco (anexos já existem).

## Dependências
REQ-031, REQ-032, REQ-033, REQ-011, REQ-016, REQ-020.

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-3501` | A vitrine vira a visão padrão de Parcerias ativas? | Sim para Direção e Gerente; lembrar a última escolha por pessoa |
| `DP-3502` | Usar fotos da casa nas telas internas (além da entrada)? | Só na faixa do Início, discreta; telas de trabalho sem foto |
