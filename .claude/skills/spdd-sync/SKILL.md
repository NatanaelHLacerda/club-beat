---
name: spdd-sync
description: Sincroniza o REASONS com o código depois de refatoração ou ajuste que não mudou comportamento, permissão, contrato nem critério de aceite.
disable-model-invocation: true
argument-hint: "[@spdd/prompt/<canvas>.md]"
---

<!-- Fonte: legalizai-projeto/spdd-compartilhado — não edite esta cópia; edite a fonte e rode sincronizar.sh -->

# SPDD Sync

O canvas reflete o código **real**, não o planejado.

## Antes de tudo

Leia `.claude/spdd-perfil.md` deste repo (verificação e commit). **O perfil ganha deste arquivo em qualquer conflito.**

## Passos

1. **Entrada.** Sem canvas, pergunte e pare.
2. **Descubra o que mudou:** pelo diff (`git diff`/`git log`) ou pelo que o usuário disser.
3. **É mudança funcional?** Se comportamento, permissão, contrato de dado ou critério mudou, **pare e use `/spdd-prompt-update`**.
4. **Compare código × canvas:** nomes, caminhos, assinaturas, dependências, textos de erro. Classifique cada divergência: estrutura, comportamento, nome, adição, remoção.
5. **Aplique a atualização** onde divergiu, priorizando Operations, Structure e Entities. Requirements não muda por refatoração. **Remoção de conteúdo pede confirmação.**
6. **Registre** numa seção *Sincronização*, ao fim do canvas, a data e o que a implementação descobriu.
7. **Confira a consistência:** sem referência órfã a nome antigo; todo componente novo tem operation.
8. **Commit** conforme o perfil e **relate** as seções atualizadas e o que pede revisão humana.

## Nunca

- Simplificar ou encurtar especificação detalhada que continua válida.
- Mudar texto de erro nos Safeguards se o código não mudou.
- Mudar o id ou o nome do arquivo do canvas.
