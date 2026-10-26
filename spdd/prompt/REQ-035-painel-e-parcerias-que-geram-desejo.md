# REASONS — REQ-035 — Painel e parcerias que geram desejo
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-035-painel-e-parcerias-que-geram-desejo.md`
**Análise:** `spdd/analysis/REQ-035-painel-e-parcerias-que-geram-desejo.md`

## R · Requirements
Início com faixa editorial e números de destaque; Parcerias ativas com Vitrine de marcas. Fora: indicadores novos, mudança de banco.

## E · Entities
- `saudacao(data: Date): 'Bom dia' | 'Boa tarde' | 'Boa noite'` — hora em `America/Sao_Paulo`: 5–11 dia, 12–17 tarde, demais noite.
- `listarLogotipos(empresas: string[]): Promise<Record<string, string>>` — empresa → URL assinada do logotipo mais recente.

## A · Approach
Regra pura com teste; uma consulta a `anexos` (`tipo = 'logotipo'`, `empresa_id in (...)`) e `createSignedUrls` em lote; a tela só chama `api.ts`.

## S · Structure
- `src/regras/saudacao.ts`, `src/regras/saudacao.test.ts`
- `src/dados/api.ts`
- `src/telas/inicio/Inicio.tsx`, `src/telas/parcerias/Parcerias.tsx`
- `src/estilo.css`

## O · Operations
- **OP-3501 Saudação.** Função e testes (limites 4h59, 5h, 11h59, 12h, 17h59, 18h, fuso).
- **OP-3502 API.** `listarLogotipos`; lista vazia sem consulta; erro com mensagem em português.
- **OP-3503 Faixa do Início.** `Topo` "Início"; seção `.faixa-abertura` (Oceano, foto do terraço a 35 %, véu): eyebrow com a data por extenso, `h2` "{saudação}, *{nome}.*", três números 300 em branco com rótulo em caixa-alta: Parcerias ativas, Empresas no funil, Prazos de hoje; sem dado, "—".
- **OP-3504 Vitrine.** Alternador Vitrine/Lista na barra de ações; padrão Vitrine para `gerente` e `direcao`, Lista para os demais; escolha em `localStorage` por pessoa (`crm.parcerias.modo.{id}`). Cartão: moldura 3:2 em Areia clara com o logotipo (`contain`) ou iniciais em Libre Bodoni itálico; marca (sem "(exemplo)") + selo de exemplo; padrão; período `dd/mm/aaaa – dd/mm/aaaa`; próximo relatório (ou "em dia"). Clique abre a ficha.
- **OP-3505 Regra do logotipo.** Pedir logotipo só das empresas com parceria vigente e etapa `ativa`/`renovacao`.

## N · Norms
- N-3501 Datas exibidas em `America/Sao_Paulo`; dinheiro não aparece na vitrine.

## S · Safeguards
- S-3501 Logotipo de empresa não ativa nunca é pedido nem exibido.
- S-3502 Falha ao carregar logotipo cai para iniciais, sem quebrar a vitrine.
- S-3503 Nada transborda em 375 px.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-3501, OP-3503 | teste + navegador |
| 2 | OP-3504 | navegador |
| 3 | OP-3505 | navegador + leitura do código |
| 4 | OP-3502 | navegador com Jurídico |
