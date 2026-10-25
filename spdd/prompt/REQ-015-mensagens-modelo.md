# REASONS — REQ-015 — Mensagens-modelo
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-015-mensagens-modelo.md`
**Análise:** `spdd/analysis/REQ-015-mensagens-modelo.md`

## R · Requirements

Mensagens iguais para todos, preenchidas com os dados da empresa e registradas. Fora: envio pela API do WhatsApp e envio real de e-mail (sem provedor).

## E · Entities

- `modelos_mensagem`: `codigo` (A1…A7, `PEDIDO_INFO`), `titulo`, `texto`, `automatico`, `atualizado_em`, `atualizado_por`.
- `mensagens`: `empresa_id`, `modelo`, `canal` (`email`, `whatsapp`), `destinatario`, `texto`, `situacao` (`aguardando_envio`, `copiada`), `autor_id` (nulo quando automática), `em`.
- Cada mensagem gera um item `historico` tipo `mensagem`.

## A · Approach

Modelos semeados na migration (são configuração, não exemplo). Preenchimento na tela por função pura; `registrar_mensagem` grava a mensagem e o histórico. `enviar_modelo_automatico(empresa, codigo)` preenche no banco para A1 e A6. Edição de modelo só por administrador.

## S · Structure

- `supabase/migrations/20261025001500_req-015-mensagens.sql`
- `src/regras/mensagens.ts` + `mensagens.test.ts`
- `src/dados/tipos.ts`, `src/dados/api.ts`
- `src/telas/empresa/AbaMensagens.tsx`, `src/telas/empresa/Ficha.tsx`
- `src/telas/config/Regras.tsx`, `src/App.tsx`

## O · Operations

- **OP-1501 Banco.** Tabelas, RLS (modelos: leitura por autenticados, edição por `sou_admin`; mensagens: leitura como a empresa, `insert` só pela função), modelos semeados, `preencher_modelo(empresa, codigo)`, `registrar_mensagem(empresa, modelo, canal, texto)`, `enviar_modelo_automatico(empresa, codigo)`. Verifica: SQL — A2 da Rede Verde contém "Rede Verde".
- **OP-1502 Regra pura.** `preencherModelo(texto, dados)` troca os campos; campo sem valor fica entre colchetes para a pessoa completar. `citaValor(texto)` detecta "R$". `bloqueioDeValor(etapa, texto)`: antes de `proposta`, texto com valor devolve S-1501. Verifica: testes.
- **OP-1503 Dados.** `listarModelos`, `salvarModelo`, `listarMensagens(empresa)`, `registrarMensagem`.
- **OP-1504 Aba Mensagens.** Escolher modelo, texto preenchido editável, campos ainda entre colchetes destacados (S-1502), botões "Enviar por e-mail" e "Copiar para WhatsApp"; lista da caixa de saída com situação. Estados: vazio "Nenhuma mensagem enviada ainda."
- **OP-1505 Regras e modelos.** Tela em `/config/regras` com os modelos; edição só para administradora; demais veem só leitura.

## N · Norms

- N-1501 Regras do `CLAUDE.md`; textos do anexo A sem mudança de sentido.

## S · Safeguards

- S-1501 "Antes da proposta, as mensagens não citam valores."
- S-1502 "Complete os campos entre colchetes antes de enviar."
- S-1503 E-mail: "Mensagem guardada na caixa de saída. O envio automático começa quando o provedor de e-mail for configurado."
- S-1504 Cópia: "Texto copiado. Cole no WhatsApp da empresa."

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-1502, OP-1504 | teste + navegador |
| 2 | OP-1501, OP-1504 | navegador: linha do tempo mostra a mensagem |
| 3 | OP-1505 | navegador: editar e usar de novo |
