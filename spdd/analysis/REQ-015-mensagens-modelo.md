# Análise — REQ-015 — Mensagens-modelo
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-015-mensagens-modelo.md`

## Resumo

Os sete modelos do anexo A e o "Pedido de informação" ficam no banco, editáveis pela administradora, preenchidos com os dados da empresa e registrados na linha do tempo e numa caixa de saída.

## Estado atual

- `historico` aceita `tipo = 'mensagem'` (`supabase/migrations/20261025000400_req-004-funil.sql`) [m].
- Não há provedor de e-mail; o `CLAUDE.md` manda tudo para a tabela `mensagens` [m].
- Ficha da empresa com abas extensíveis (`src/telas/empresa/Ficha.tsx`) [m].

## Estado desejado

Na ficha, escolher um modelo, ver o texto preenchido, ajustar e "Enviar por e-mail" (vai para a caixa de saída) ou "Copiar para WhatsApp". Modelos automáticos (A1, A6) saem por função do banco, chamada pelos REQs 002 e 013.

## Conceitos e domínio

- **Modelo**: código, título, texto com campos `[nome]`, `[empresa]`, `[Gerente]`, `[data]`, `[padrão]` [d: anexo A].
- **Caixa de saída**: mensagem registrada com canal e situação ("aguardando envio", "copiada") [d: CLAUDE.md].
- **Sem valores antes da proposta** [d: regra 6].
- A1 do anexo diz "em até ... dias úteis"; o REQ-002 fixa 1 dia útil [d].

## Delta

Tabelas `modelos_mensagem` e `mensagens`; funções `preencher_modelo` e `registrar_mensagem`; regra pura de preenchimento e da trava de valores; aba "Mensagens" na ficha; tela "Regras e modelos" para editar.

## Riscos

- O texto pode ser ajustado à mão e ganhar um valor antes da proposta: a trava confere o texto final [i].
- Copiar para a área de transferência pode falhar no navegador: mostrar o texto selecionável [i].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 A2 preenchido | Sim | — |
| 2 Copiar e registrar | Sim | — |
| 3 Modelo editado | Sim | — |

## Direção recomendada

Modelos no banco (editáveis sem deploy); preenchimento puro em `src/regras/mensagens.ts` e equivalente em SQL só para os automáticos.

## Decisões pendentes

DP-1501 (texto do Pedido de informação: rascunho para a Fernanda revisar) e DP-1502 (seguir o anexo: A2 é o aviso de que a Gerente vai entrar em contato) decididos pela recomendação.

## Prontidão para REASONS

Pronto.
