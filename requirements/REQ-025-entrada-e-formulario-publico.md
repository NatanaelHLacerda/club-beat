# REQ-025 — Entrada e formulário público na identidade do Club
**Status:** RASCUNHO
**Origem:** conversa de 2026-10-25 (guia da marca: tom premium, muito espaço em branco, Oceano e Areia)

## Contexto

O login e o formulário `/seja-parceiro` usam o mesmo visual interno. O formulário é a primeira impressão da empresa sobre o Club.

## Problema

A página pública não transmite o tom premium e seletivo do Club.

## Objetivo

Login e formulário público com a identidade da marca: faixa Oceano com a marca e uma frase curta, área do formulário em Areia clara, etapas com indicador visual e confirmação elegante.

## Atores

Empresas interessadas (formulário) e usuários do CRM (login).

## Regras de negócio

1. Login em duas metades no computador: à esquerda Oceano com "Club Beat" (Libre Bodoni) e uma frase do vocabulário do Club; à direita o formulário. No celular, só o formulário com a marca no topo.
2. Formulário público: cabeçalho Oceano com a marca e "Parcerias", indicador das 5 etapas com nome e número, campos em Space Grotesk, botão principal Oceano.
3. Tela de confirmação com o texto de hoje e, se houver, o botão do WhatsApp do Club.
4. Textos sem termos técnicos, sem promessas de público ou resultado.
5. Regras do REQ-002 inalteradas (validação, anexos, consentimento).

## Escopo

### Incluído
- Telas de login, redefinir senha, formulário público e política de privacidade.

### Fora do escopo
- Fotos do Club (dependem do envio com autorização de uso).

## Critérios de aceite

1. Dado o formulário na etapa 3, então o indicador mostra as etapas 1 e 2 concluídas e "Sobre a parceria" atual.
2. Dado o login no computador, então a metade esquerda é Oceano com a marca em Libre Bodoni.
3. Dado a tela de 375 px, então o formulário ocupa a largura toda sem rolagem lateral.
4. Dado um CNPJ inválido, então a mensagem de hoje ("CNPJ inválido") aparece no novo visual.

## Restrições

Sem dependência nova. Contraste AA.

## Dependências

REQ-018, REQ-002.

## Decisões pendentes

| # | Pergunta | Recomendação |
|---|---|---|
| `DP-2501` | Usar foto do Club no login e no formulário? | Só quando houver foto com autorização; até lá, faixa Oceano com detalhe dourado |
