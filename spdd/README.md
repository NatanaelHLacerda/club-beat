# SPDD — CRM de Parcerias Club Beat

```text
requirements/REQ-XXX   (semente)
   ↓
spdd/analysis/REQ-XXX  (análise)
   ↓
spdd/prompt/REQ-XXX    (REASONS Canvas — quality gate)
   ↓
implementação          (testes de aceite primeiro, depois código)
   ↓
validação
```

## Regras

- análise não autoriza implementação;
- REASONS só autoriza implementação com status `APROVADO` dado por humano;
- decisão pendente (`DP-XXYY`) não é escolhida pelo agente;
- mudança funcional atualiza o REASONS antes do código; refatoração sem mudança funcional sincroniza o REASONS depois;
- sem `v2`/`final`: o mesmo arquivo evolui;
- não passam pela cadeia: ajuste de cor, espaçamento, texto e correção de estilo.

## Base de domínio

- Documento-base: `~/Downloads/analise-fernanda.pdf` (Fluxo de parcerias v1.0, 22/10/2026).
- Cenário: `cenario-crm.html`.

## Normas comuns a todos os REASONS

Valem as regras do `CLAUDE.md` (stack React + Supabase, arquitetura, dados, visual) e do perfil `.claude/spdd-perfil.md`. Cada canvas só registra o que for diferente.
