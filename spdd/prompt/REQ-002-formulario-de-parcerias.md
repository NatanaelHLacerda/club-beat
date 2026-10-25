# REASONS — REQ-002 — Formulário de parcerias
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-002-formulario-de-parcerias.md`
**Análise:** `spdd/analysis/REQ-002-formulario-de-parcerias.md`

## R · Requirements

Toda ficha do site vira empresa em "Recebida", com anexos, A1 e aviso à Isabela. Fora: consulta à Receita, WhatsApp pela API, envio real de e-mail.

## E · Entities

- `parametros` (`chave`, `valor` jsonb, `descricao`): começa com `whatsapp_club` (nulo) e `prazo_guarda_meses` (nulo).
- `avisos` (`usuario_id`, `empresa_id`, `tipo`, `texto`, `lido_em`, `em`): leitura e marcação de lido só pelo dono.
- Envio: `dados` (campos do formulário) + lista de anexos `{caminho, nome, tamanho, tipo}` na pasta `formulario/<envio>/`.

## A · Approach

`enviar_ficha` (anon, `security definer`) valida obrigatórios, CNPJ, aceite, consentimento e as iscas anti-robô; cria a empresa (`origem = site`, `consentimento_em = now()`), liga os anexos, chama `enviar_modelo_automatico(A1)` e cria um aviso para cada usuário de papel 1ª pessoa. CNPJ existente: não duplica, registra "Nova ficha recebida pelo site" na empresa existente e avisa do mesmo jeito. A tela valida igual antes de enviar.

## S · Structure

- `supabase/migrations/20261025002000_req-002-formulario.sql`
- `src/regras/formulario.ts` + `formulario.test.ts`
- `src/dados/tipos.ts`, `src/dados/api.ts`
- `src/telas/publico/Formulario.tsx`, `src/telas/publico/Privacidade.tsx`
- `src/telas/avisos/Avisos.tsx`, `src/App.tsx`

## O · Operations

- **OP-0201 Banco.** `cnpj_valido(text)`; `parametros`; `avisos`; bucket com tipos permitidos (PDF, PPT, PPTX, PNG, JPEG, SVG) e 20 MB; política de upload `anon` e `authenticated` só em `formulario/`; leitura de objeto também quando há linha em `anexos` com aquele caminho e a empresa é legível; `enviar_ficha(dados jsonb, anexos jsonb)`; `avisar_papel(papel, empresa, tipo, texto)`. Verifica: SQL como `anon`.
- **OP-0202 Regra pura.** `validarEtapa(n, ficha)` devolve erros por campo para cada uma das 5 etapas, com os textos de S-0201 a S-0205. Verifica: testes.
- **OP-0203 Dados.** `enviarFicha(ficha, arquivos)`: sobe os arquivos na pasta do envio e chama a função. `listarAvisos`, `marcarAvisoLido`, `contarAvisosNaoLidos`.
- **OP-0204 Formulário.** `/seja-parceiro`, fora da casca: cabeçalho do Club, "Etapa N de 5", barra de progresso, Voltar/Continuar, erros por campo, último passo com os dois aceites e o campo-isca escondido. Depois do envio, tela S-0206 e botão do WhatsApp só se `whatsapp_club` existir. Funciona a 375 px.
- **OP-0205 Privacidade.** `/seja-parceiro/privacidade`: como os dados são usados (cap. 5), marcado como versão provisória até a revisão do Jurídico.
- **OP-0206 Avisos.** `/avisos`: lista do usuário (não lidos primeiro), link para a empresa, "Marcar como lido"; contador no menu.

## N · Norms

- N-0201 Regras do `CLAUDE.md`. Campos e opções do `src/dados/campos.ts`.
- N-0202 O formulário não pede CPF, dados financeiros detalhados, dados sensíveis nem dados de membros.
- N-0203 Migrations aplicam pela ordem do nome: esta usa o prefixo `20261025002000` para vir depois das do REQ-004 e REQ-015 (o número do REQ fica no nome).

## S · Safeguards

- S-0201 "CNPJ inválido"
- S-0202 "Arquivo acima de 20 MB"
- S-0203 "Preencha este campo."
- S-0204 "Marque o consentimento de privacidade para enviar."
- S-0205 "Informe o site ou o Instagram."
- S-0206 "Recebemos a sua ficha. Nossa equipe responde em até 1 dia útil. Este envio ainda não é uma proposta."
- S-0207 Visitante anônimo não lê nenhuma tabela nem arquivo.

## Matriz de rastreabilidade

| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-0201, OP-0204, OP-0206 | navegador: enviar e ver no funil e nos avisos da Isabela |
| 2 | OP-0202, OP-0201 | teste + navegador |
| 3 | OP-0203, OP-0201 | navegador: arquivo de 25 MB |
| 4 | OP-0202, OP-0201 | teste + SQL |
| 5 | OP-0201 | SQL: A1 na caixa de saída da empresa |
