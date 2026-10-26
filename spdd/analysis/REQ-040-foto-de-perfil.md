# Análise — REQ-040 — Foto de perfil
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-040-foto-de-perfil.md`

## Resumo
Foto da pessoa num bucket privado próprio, apontada por `perfis.foto_caminho` via rpc; o `Avatar` mostra a foto quando sabe de quem é.

## Estado atual
- `Avatar({ nome, tamanho })` desenha iniciais; usado para pessoas (11 lugares: cabeçalho, menu, Meu perfil, responsável em Empresas/Renovações/Parcerias/Prazos/Direção, cartão do funil, Ficha, linha do tempo) e para marcas (empresas) [m].
- `perfis` sem coluna de foto; `select` liberado a autenticados; update só por rpc [m].
- Bucket `anexos` (empresas) com leitura por etapa: não serve para pessoa [m].
- Hospedado: `EXECUTE` padrão a `authenticated`, nunca a `anon` (migration de permissões) [m].

## Estado desejado
- Bucket `fotos-perfil` privado, 1 MB, só JPEG (o navegador já envia 256 × 256 JPEG); leitura por autenticados; escrita só na pasta `{auth.uid()}`.
- rpc `definir_minha_foto(caminho)` valida pasta e existência do arquivo.
- `Avatar` com prop `pessoa` (id) que procura a foto num contexto carregado uma vez na casca (`listarFotosDaEquipe`, URLs assinadas de 1 h); falha de carga volta às iniciais.

## Delta
Migration `20261026020000_req-040-foto-de-perfil.sql`; `regras/foto.ts` (+ teste); `api.ts`; `componentes/FotosEquipe.tsx` (contexto); `ui/componentes.tsx` (`Avatar`); `Casca.tsx` (provedor); `MeuPerfil.tsx`; 11 chamadas de `Avatar` de pessoa ganham `pessoa`.

## Riscos
- URL assinada expira em 1 h; tela aberta por horas volta às iniciais até recarregar [i]: o contexto renova a cada 50 min.
- Arquivo antigo fica órfão ao trocar [d]: a tela apaga o anterior depois de apontar o novo.

## Cobertura dos critérios
| Critério | Atendível |
|---|---|
| 1–5 | Sim |

## Direção recomendada
Contexto único de fotos na casca; `Avatar` continua sem chamar dados.

## Decisões pendentes
DP-4001 (todos os avatares de pessoa) e DP-4002 (recorte automático ao centro) na recomendação.

## Prontidão para REASONS
Pronto.
