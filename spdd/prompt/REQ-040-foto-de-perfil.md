# REASONS — REQ-040 — Foto de perfil
**Status:** APROVADO — por delegação: semente APROVADO — Natanael, 2026-10-26, segue a cadeia
**Requisito:** `requirements/REQ-040-foto-de-perfil.md`
**Análise:** `spdd/analysis/REQ-040-foto-de-perfil.md`

## R · Requirements
Cada pessoa envia, troca ou tira a própria foto; a foto aparece onde a pessoa aparece com avatar. Fora: foto de empresa, administradora mexer na foto de outra pessoa.

## E · Entities
- `perfis.foto_caminho text null` — `{id}/{carimbo}.jpg`.
- Bucket `fotos-perfil` (privado, 1 MB, `image/jpeg`).
- `definir_minha_foto(caminho text) returns void`.
- `erroArquivoFoto({type,size})`, `recorteQuadrado(l, a)`, `ladoFoto = 256`.

## A · Approach
Navegador valida, recorta e reduz (canvas → JPEG 0,86); envia ao Storage; rpc aponta; apaga o anterior; contexto de fotos recarrega.

## S · Structure
- `supabase/migrations/20261026020000_req-040-foto-de-perfil.sql`
- `src/regras/foto.ts` (+ teste), `src/dados/api.ts`, `src/dados/tipos.ts`
- `src/componentes/FotosEquipe.tsx`, `src/componentes/ui/componentes.tsx`, `src/componentes/Casca.tsx`
- `src/telas/perfil/MeuPerfil.tsx` e as 11 chamadas de `Avatar` de pessoa

## O · Operations
- **OP-4001 Migration.** Coluna, bucket, quatro políticas do Storage, rpc com `revoke`/`grant`.
- **OP-4002 Regras.** Validação e recorte com testes.
- **OP-4003 API.** `enviarMinhaFoto(arquivo: Blob, anterior)`: grava `{id}/{Date.now()}.jpg`, chama a rpc, apaga o anterior; `removerMinhaFoto(anterior)`; `listarFotosDaEquipe(): Record<id, url>` (URLs de 1 h).
- **OP-4004 Contexto.** `ProvedorFotos` na casca: carrega ao entrar, renova a cada 50 min, expõe `fotoDe(id)` e `recarregarFotos()`.
- **OP-4005 Avatar.** Prop `pessoa?: string`; com foto, `<img>` redondo com `alt=""` (o nome já aparece ao lado) e `onError` volta às iniciais.
- **OP-4006 Meu perfil.** Avatar 96 px com foto; "Enviar foto"/"Trocar foto" (input de arquivo), "Remover foto"; estados enviando/erro/sucesso em texto.
- **OP-4007 Chamadas.** Passar `pessoa` nos 11 avatares de pessoa.

## N · Norms
- N-4001 `Avatar` segue sem chamar dados; só lê o contexto.

## S · Safeguards
- S-4001 Escrita só na própria pasta; rpc recusa caminho de outra pessoa ou inexistente.
- S-4002 Visitante sem login não lê fotos.
- S-4003 Sem foto ou com erro de carga, iniciais.

## Matriz de rastreabilidade
| Critério | Operations | Verificação |
|---|---|---|
| 1 | OP-4003–4006 | navegador (envio real local) |
| 2 | OP-4002, OP-4006 | teste + navegador |
| 3 | OP-4003, OP-4006 | navegador |
| 4 | OP-4001 | `supabase/testar.sh` |
| 5 | OP-4001 | Storage local sem token |
