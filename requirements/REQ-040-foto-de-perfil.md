# REQ-040 — Foto de perfil
**Status:** APROVADO — Natanael, 2026-10-26 (*"aprovo e siga até o fim e realize o push"*): decisões pendentes na recomendação.
**Origem:** conversa de 2026-10-26 (*"adicione foto de perfil na tela Meu perfil"*).

## Contexto
"Meu perfil" (REQ-039) mostra o avatar com as iniciais. O componente `Avatar` (REQ-018) desenha iniciais sobre um tom da marca e é usado no cabeçalho, no menu da pessoa, em Usuários, nas tabelas (responsável), no quadro do funil, nos avisos e no Início. Não existe lugar para guardar foto de pessoa: o bucket `anexos` é das empresas, com regras de leitura por etapa.

## Problema
A equipe não se reconhece pelas iniciais; o CRM fica impessoal.

## Objetivo
Cada pessoa envia, troca ou tira a própria foto em "Meu perfil", e a foto aparece no lugar das iniciais.

## Atores
Todos os usuários (cada um só na própria foto).

## Regras de negócio
1. Em "Meu perfil": botão "Enviar foto" (e "Trocar foto" / "Remover foto" quando houver).
2. Aceita JPG, PNG ou WebP de até 5 MB; o navegador recorta ao centro em quadrado e reduz para 256 × 256 px JPEG antes de enviar (sem dependência nova, por `canvas`).
3. Guardada num bucket próprio e privado (`fotos-perfil`), caminho `{id da pessoa}/{arquivo}`; só a própria pessoa grava ou apaga na sua pasta; qualquer pessoa logada vê as fotos da equipe; visitante sem login não vê.
4. `perfis.foto_caminho` aponta para a foto atual; muda só pela rpc `definir_minha_foto(caminho)` (`security definer`), que aceita apenas caminho na pasta da própria pessoa ou `null` para remover.
5. Sem foto, ou se a foto não carregar, o avatar volta às iniciais.
6. Foto é dado pessoal da equipe: não aparece em páginas públicas nem na ficha de parceria.

## Escopo
### Incluído
- Migration (coluna, bucket, políticas do Storage, rpc); `api.ts`; regra pura de validação do arquivo (com teste); `MeuPerfil.tsx`; `Avatar` aceita foto.
### Fora do escopo
- Foto de empresa/marca (a vitrine usa o logotipo, REQ-035).
- Administradora trocar a foto de outra pessoa.

## Critérios de aceite
1. Dado "Meu perfil", quando envio uma foto JPG de 3 MB, então ela aparece no meu avatar em segundos, em 256 × 256.
2. Dado um arquivo PDF ou uma imagem de 8 MB, então aparece o erro em texto e nada é enviado.
3. Dado "Remover foto", então o avatar volta às iniciais.
4. Dado outra pessoa logada, quando tenta gravar na minha pasta ou chamar a rpc com o meu caminho, então o banco recusa.
5. Dado um visitante sem login, então a foto não abre.

## Restrições
Sem dependência nova. Migration nova aplicada no hospedado antes do deploy do front.

## Dependências
REQ-018, REQ-039.

## Decisões pendentes
| # | Pergunta | Recomendação |
|---|---|---|
| `DP-4001` | Onde a foto aparece? | Em todo lugar onde a pessoa aparece com avatar: cabeçalho, menu, Meu perfil, Usuários, responsáveis nas tabelas e no funil, avisos e Início |
| `DP-4002` | Recorte automático ao centro ou tela para ajustar o enquadramento? | Recorte automático ao centro (sem tela de ajuste nesta versão) |
