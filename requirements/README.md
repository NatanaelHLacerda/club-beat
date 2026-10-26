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

### Cadeia 2 — novo visual (kit de referência + guia da marca)

Tema claro com a paleta da marca já aplicado nas cores (fora da cadeia: ajuste de cor). Referências: `~/Downloads/CRM Dashboard UI Kit.zip` e `~/Downloads/Elementos_de_Marca_para_o_Designer.pdf`.

| REQ | Semente | Depende de |
|---|---|---|
| 018 | Identidade visual e biblioteca de componentes | — |
| 019 | Casca e navegação no estilo do kit | 018 |
| 020 | Painel inicial no estilo do kit | 018, 019, 014, 016 |
| 021 | Funil e Empresas no novo visual | 018, 019, 004, 014 |
| 022 | Ficha da empresa no novo visual | 018, 019, 014 |
| 023 | Calendário em visão de semana e de mês | 018, 019, 012 |
| 024 | Listas de acompanhamento no novo visual | 018, 019 |
| 025 | Entrada e formulário público na identidade do Club | 018, 002 |

Cadeia 3 — refino pelo kit do Figma (APROVADO):

| REQ | Título | Depende de |
|---|---|---|
| 026 | Escala, ritmo e profundidade pelo kit | 018 |
| 027 | Cabeçalho de cartão e barra de ações da tela | 026, 021 |
| 028 | Tabelas no padrão do kit | 026, 024 |
| 029 | Quadro do funil no padrão do kit | 026, 021 |
| 030 | Ficha da empresa: painéis e histórico no padrão do kit | 026, 022 |

### Cadeia 4 — design system do site e desejo (APROVADO)

Referência: https://site-beat-life-club.vercel.app/ (código em `~/Documents/amigos/parcerias-lp`, Manual de Marca v2.0). Substitui a seção Visual do `CLAUDE.md` (Sora, pílulas, cantos redondos) ao final do REQ-031.

| REQ | Semente | Depende de |
|---|---|---|
| 031 | Fundamentos da marca do site (tokens, tipografia, forma, logo) | 018, 026 |
| 032 | Componentes no padrão do site | 031 |
| 033 | Casca com a marca do site | 031, 032, 019 |
| 034 | Entrada e páginas públicas que geram desejo | 031, 032, 025 |
| 035 | Painel e parcerias que geram desejo | 031, 032, 033, 011, 016, 020 |
| 036 | Telas de trabalho no novo padrão | 031, 032, 033 |

### Cadeia 5 — menu lateral enxuto e menu da pessoa (APROVADO)

| REQ | Semente | Depende de |
|---|---|---|
| 037 | Menu da pessoa (perfil, disponibilidade, avisos, configuração, sair) | 007, 019, 033 |
| 038 | Menu lateral enxuto (sem Configuração e Avisos) | 037 |
| 039 | Meu perfil (nome, senha, disponibilidade) | 001, 037 |
| 040 | Foto de perfil | 018, 039 |

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
