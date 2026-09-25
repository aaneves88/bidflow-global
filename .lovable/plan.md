# Instalar Google Tag Manager + tag do Google Ads

## Objetivo
Adicionar o Google Tag Manager (`GTM-TZHKGXJ4`) e a tag de conversão do Google Ads (`AW-18401533293`) ao site do Orca, seguindo o mesmo padrão do Meta Pixel: **só carrega em produção** (`orca-mento.app` / `www.orca-mento.app`), para não contaminar as campanhas com acessos de preview e desenvolvimento.

## O que será feito

### 1. Google Tag Manager no `index.html`
- Adicionar o script do GTM no `<head>`, envolto numa verificação de hostname (igual ao Meta Pixel): se não for produção, o script nem carrega.
- Adicionar o fallback `<noscript><iframe ...></noscript>` no `<body>` (o HTML5 não permite esse tipo de noscript no `<head>`).

### 2. Tag do Google Ads (AW-18401533293) via gtag.js
- Criar `src/lib/googleAds.ts` com:
  - Carregamento do `gtag.js` com o ID `AW-18401533293`, apenas em produção.
  - Função `trackGoogleAdsConversion(sendTo, data?)` para disparar conversões quando configurarmos os rótulos de conversão no painel do Google Ads.
- Inicializar no `src/main.tsx` (após o `captureAttribution()`).

### 3. Verificação
- Conferir que o preview (localhost/lovable.app) **não** carrega os scripts.
- Rodar `tsc --noEmit`.

## Observações
- O GTM já permite gerenciar outras tags pelo painel do Google sem mexer no código — a tag AW pode ser configurada lá dentro depois, se preferir. Vou instalar os dois como você pediu; se quiser manter só o GTM e configurar o Ads pelo painel, me avisa.
- Nenhum evento de conversão específico (cadastro, compra) será disparado ainda — isso depende dos rótulos de conversão que você criar no Google Ads. Quando tiver os rótulos, eu conecto aos eventos (ex: `signup_completed`, checkout).
- Atualizo o `docs/ROADMAP.md`/release notes conforme seu padrão de documentar tudo.

## Detalhes técnicos
- Arquivos: `index.html`, `src/lib/googleAds.ts` (novo), `src/main.tsx`, docs de release.
- Nenhuma mudança de banco ou backend.
