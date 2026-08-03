# Correções: logo quebrada e PIX no link público

## Diagnóstico (verificado agora)

**PIX** — não é bug de código nem de banco:
- A chave PIX do perfil existe (CPF cadastrado) e a função do banco `get_proposal_pix('35ef0ffac419')` retorna corretamente a chave, o tipo e o nome do recebedor.
- Baixei o JavaScript publicado em orca-mento.app: ele **não contém** a chamada de PIX. Ou seja, o site publicado ainda é uma build antiga, anterior à funcionalidade de PIX.
- Conclusão: falta **publicar** o app. Nada a corrigir no código do PIX.

**Logo da Orca** — a imagem publicada carrega (HTTP 200), e no ambiente de desenvolvimento também é servida normalmente. O arquivo `orca-mark.png` tem **624 KB**, tamanho muito alto para um ícone de 28 px de altura: em conexões lentas ou no primeiro carregamento ele frequentemente falha/demora, o que explica o ícone quebrado da captura de tela.

## O que fazer

1. **Publicar o app** para que o link público e o PDF passem a mostrar o QR Code PIX (e também as demais entregas recentes: desconto, catálogo de produtos, PIX por proposta).
2. **Otimizar a logo**: gerar uma versão reduzida da marca (aprox. 128 px, poucos KB) e usá-la nos pontos onde ela aparece pequena — cabeçalho do app, proposta pública, rodapés, página de privacidade, unsubscribe e entrada mobile. A arte original continua disponível para usos maiores.
3. **Fallback visual**: caso a imagem não carregue, exibir a marca em texto em vez do ícone quebrado.

## Detalhes técnicos

- Nova variante `src/assets/brand/orca-mark-sm.png` (redimensionada da atual, sem alterar a arte).
- Trocar o import em `AppLayout.tsx`, `PublicProposal.tsx`, `Privacy.tsx`, `Unsubscribe.tsx`, `MobileEntry.tsx` e `Landing.tsx` para a variante pequena.
- Adicionar `loading="eager"`, `width`/`height` explícitos e `onError` que oculta o `img` e mantém o texto "Orca".
- Nenhuma mudança de banco de dados é necessária.

## Verificação

- Conferir na proposta pública `/p/35ef0ffac419` (após publicar) que o bloco PIX e o QR aparecem, e que o PDF baixado traz o QR.
- Conferir que a logo aparece no cabeçalho do app e no topo da proposta pública.
