# Análise — REQ-002 — Formulário de parcerias
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-25, segue a cadeia
**Requisito:** `requirements/REQ-002-formulario-de-parcerias.md`

## Resumo

Página pública, sem login, em 5 etapas, que grava a ficha como empresa em "Recebida", com anexos, envia a A1 automática e avisa a 1ª pessoa.

## Estado atual

- `empresas` tem todos os campos do cap. 5 e `consentimento_em`; inserção só por usuário autenticado (`20261025000400_req-004-funil.sql`) [m].
- `enviar_modelo_automatico` grava A1 na caixa de saída (`20261025001500_req-015-mensagens.sql`) [m].
- Bucket `anexos` privado, leitura pela empresa do caminho `empresa/<id>/…` [m].
- `cnpjValido` e catálogo de campos prontos (`src/regras/formato.ts`, `src/dados/campos.ts`) [m].
- Não existe tabela de avisos nem de parâmetros [m].

## Estado desejado

Empresa preenche a ficha no celular, envia, vê a confirmação; o CRM tem a empresa, os anexos, a A1 na caixa de saída e um aviso para a Isabela.

## Conceitos e domínio

- Visitante anônimo não pode escrever direto nas tabelas: o envio passa por uma função que valida tudo de novo [i].
- Anexo é enviado antes da ficha existir: vai para uma pasta temporária do envio e a função liga o arquivo à empresa [i].
- **Proteção contra robôs** "verificação simples" [d]: um serviço de CAPTCHA pede conta externa (parada da cadeia); a recomendação é campo-isca e tempo mínimo de preenchimento [i].
- **Política de privacidade**: o Club não tem uma publicada [i]; prazo de guarda é DP-0203 (guardar sem apagar) [d].
- **Investimento previsto**: faixas pendentes (DP-0202) — campo opcional só com "ainda não sei" até a Direção definir [d].
- **CNPJ já cadastrado**: tratado no REQ-003; aqui a nova ficha vira item na linha do tempo da empresa existente, sem duplicar [i].
- **Aviso**: nasce a tabela `avisos` (o REQ-014 completa a central) [i].

## Delta

Banco: `cnpj_valido()`, `parametros`, `avisos`, `enviar_ficha(dados, anexos)` para `anon`, política de upload anônimo na pasta `formulario/`, tipos de arquivo do bucket, leitura de anexo pela tabela `anexos`. Front: rotas públicas `/seja-parceiro` e `/seja-parceiro/privacidade`, tela de avisos simples.

## Riscos

- Upload anônimo pode ser abusado: limite de 20 MB e tipos fixos no bucket; arquivo sem ficha fica órfão na pasta temporária [i].
- A1 fica "aguardando envio" até haver provedor de e-mail (parada da cadeia registrada) [d].

## Cobertura dos critérios

| Critério | Atendível | Lacuna |
|---|---|---|
| 1 Envio completo | Sim | — |
| 2 CNPJ inválido | Sim | — |
| 3 Anexo de 25 MB | Sim | — |
| 4 Sem consentimento | Sim | — |
| 5 E-mail A1 | Parcial | registrada na caixa de saída; envio real depende de provedor |

## Direção recomendada

Formulário no próprio CRM (DP-0201), envio por função `security definer` com validação no banco, anexos em pasta temporária ligados na função.

## Decisões pendentes

DP-0201 a DP-0204 pela recomendação (no próprio CRM; investimento só "ainda não sei"; guardar sem apagar; nome "Club Beat").

## Prontidão para REASONS

Pronto.
