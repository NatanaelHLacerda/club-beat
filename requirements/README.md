# Requisitos — CRM de Parcerias Club Beat

CRM do fluxo de parcerias do Club Beat. Fonte: documento-base `~/Downloads/analise-fernanda.pdf` (v1.0, 22/10/2026) e o cenário `cenario-crm.html`.

## Convenção

```text
requirements/REQ-XXX-slug.md      ← semente (o quê e por quê)
spdd/analysis/REQ-XXX-slug.md     ← análise
spdd/prompt/REQ-XXX-slug.md       ← REASONS Canvas (fonte da verdade do código)
```

## Cadeia e ordem de entrega

| REQ | Semente | Depende de |
|---|---|---|
| 001 | Acesso e papéis | — |
| 004 | Funil de parcerias | 001 |
| 015 | Mensagens-modelo | 004 |
| 002 | Formulário de parcerias | 004 |
| 003 | Entrada manual e indicação | 002, 004 |
| 005 | Primeira triagem | 004, 015 |
| 006 | Segunda triagem: classificação e padrão | 005 |
| 007 | Distribuição entre Gerentes e passagem | 006, 015 |
| 012 | Calendário anual | 001 |
| 008 | Reunião e proposta | 006, 007, 012 |
| 009 | Porta da Direção | 001, 008 |
| 010 | Contrato e assinatura | 008, 009, 012 |
| 011 | Parcerias ativas e acompanhamento | 010 |
| 013 | Renovação ou encerramento | 009, 011, 015 |
| 014 | Prazos e alertas | 004 |
| 016 | Painel e resumo mensal | 004, 011, 012, 013 |
| 017 | Migração dos parceiros atuais | 006, 010, 011 |

## Template

```markdown
# REQ-XXX — Título
**Status:** RASCUNHO
**Origem:** conversa de AAAA-MM-DD

## Contexto
## Problema
## Objetivo
## Atores
## Regras de negócio
## Escopo
### Incluído
### Fora do escopo
## Critérios de aceite
## Restrições
## Dependências
## Decisões pendentes
```

## Status

`RASCUNHO` → `EM_REVISAO` → `APROVADO` (só por decisão humana) → `OBSOLETO`.
