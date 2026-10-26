# Análise — REQ-035 — Painel e parcerias que geram desejo
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-035-painel-e-parcerias-que-geram-desejo.md`

## Resumo
Faixa editorial no topo do Início e visão "Vitrine" em Parcerias ativas, com logotipo da parceira (anexo `logotipo`) ou iniciais.

## Estado atual
- Início (`src/telas/inicio/Inicio.tsx`): `Topo` "Olá, Nome" com o mês; quatro cartões de número; grades de gráficos e listas [m].
- Parcerias ativas (`src/telas/parcerias/Parcerias.tsx`): quatro cartões de número e tabela; dados por `listarParcerias('vigente')` (empresa embutida: marca, etapa, exemplo) [m].
- Anexos: tabela `anexos` com `tipo = 'logotipo'`, bucket privado `anexos`, leitura por RLS (`pode_ler_empresa_id`) e política do Storage ligada à linha do anexo; `urlAnexo` cria URL assinada de um caminho [m].
- Formulário: logotipo "só será usado depois do acordo" [m].
- Não existe regra de saudação por hora [m].

## Estado desejado
- Início: faixa Oceano com foto discreta (terraço), eyebrow com a data, "Bom dia, *Fernanda.*" e três números grandes leves (parcerias ativas, empresas no funil, prazos de hoje). `Topo` vira "Início".
- Parcerias: alternador Vitrine/Lista; Vitrine em cartões com logotipo (ou iniciais em Libre Bodoni), padrão, período e próximo relatório; escolha lembrada por pessoa; padrão Vitrine para Direção e Gerente.

## Conceitos e domínio
- Empresa no funil: etapa fora de `ativa`, `renovacao`, `encerrada`, `espera`, `recusada` [d].
- Prazos de hoje: os mesmos do cartão "Para hoje" (vence hoje ou atrasado, da pessoa) [m].
- Logotipo exibível: anexo `logotipo` de empresa com parceria `vigente` e etapa `ativa`/`renovacao` [m].

## Delta
- `src/regras/saudacao.ts` (+ teste): saudação pela hora de São Paulo.
- `src/dados/api.ts`: `listarLogotipos(empresas)` → mapa empresa → URL assinada (uma consulta + `createSignedUrls`).
- `Inicio.tsx`, `Parcerias.tsx`, `estilo.css` (bloco REQ-035).
- Banco: nenhum.

## Riscos
- URL assinada vale 5 min; a vitrine recarrega ao voltar à tela [i]. Aceito.
- Logotipo com fundo transparente branco some sobre Areia clara [i]: moldura com fundo Areia clara e `object-fit: contain` com respiro.

## Cobertura dos critérios
| Critério | Atendível |
|---|---|
| 1 faixa no Início | Sim |
| 2 Vitrine | Sim |
| 3 logotipo só de ativa | Sim (filtro + parceria vigente) |
| 4 RLS do Jurídico | Sim (consulta como o usuário; Storage respeita a política) |

## Direção recomendada
Uma função de API nova; regras puras para saudação; vitrine como componente local da tela.

## Decisões pendentes
DP-3501 (Vitrine padrão para Direção e Gerente, lembrando por pessoa) e DP-3502 (foto só na faixa do Início) na recomendação.

## Prontidão para REASONS
Pronto.
