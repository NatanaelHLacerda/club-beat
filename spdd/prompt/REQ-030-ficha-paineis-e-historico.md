# REASONS — REQ-030 — Ficha da empresa: painéis e histórico no padrão do kit
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-030-ficha-paineis-e-historico.md`
**Análise:** `spdd/analysis/REQ-030-ficha-paineis-e-historico.md`

## R · Requirements
Dados legíveis de relance, abas num só cartão, histórico como conversa. Fora: conteúdo e regras das abas.

## E · Entities
Sem entidade nova.

## A · Approach
`dl.painel-dados` em 4 colunas (2 abaixo de 1280 px, 1 abaixo de 600 px); `section.conteudo-abas`; `.conteudo-aba .cartao` vira painel sem sombra; `form.anotar` sticky no pé.

## S · Structure
- `src/telas/empresa/PerfilEmpresa.tsx`, `Ficha.tsx`, `AbaTempo.tsx`, `src/estilo.css`

## O · Operations
- **OP-3001 Perfil.** Nome sem "(exemplo)" quando a pill aparece; pills; painel com Razão social, CNPJ, Contato, E-mail, WhatsApp (copiar), Segmento, Cidade.
- **OP-3002 Abas.** Grupos segmentados com ativo em contorno Oceano; abas com sublinhado dourado; `aria-pressed`/`aria-current`.
- **OP-3003 Painéis.** Blocos internos tingidos, campos claros.
- **OP-3004 Linha do tempo.** Avatar (ou ícone para Sistema), autor, tipo, data; texto; campo de nota fixo com rótulo acessível.

## N · Norms
- N-3001 Nada de cartão dentro de cartão.

## S · Safeguards
- S-3001 Sem rolagem horizontal em 900 e 375 px.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-3001 | navegador 1600 px |
| 2 | OP-3004 | navegador (Linha do tempo) |
| 3 | todas | navegador 900 e 375 px |
