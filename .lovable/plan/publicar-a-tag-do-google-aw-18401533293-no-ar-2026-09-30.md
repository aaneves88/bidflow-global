# Publicar a tag do Google (AW-18401533293) no ar

## Situação atual
A tag do Google que você colou **já está instalada no código**:
- `src/lib/googleAds.ts` carrega o `gtag.js` com o ID `AW-18401533293` e já é iniciada no `src/main.tsx`.
- O Google Tag Manager (`GTM-TZHKGXJ4`) também já está no `index.html`.
- Ambos só carregam em produção (`orca-mento.app` / `www.orca-mento.app`) — de propósito, para não contaminar as campanhas com acessos de preview e teste.

O aviso "Sua tag do Google não foi detectada em orca-mento.app" aparece porque a **versão publicada do site ainda é anterior** a essa instalação. O código novo só vai ao ar ao publicar.

## O que será feito

### 1. Publicar o app
- Publicar a versão atual (que já inclui GTM + tag do Google + funil de nichos da v0.8.2).

### 2. Verificar no site publicado
- Abrir `https://orca-mento.app` e confirmar que o `gtag.js` e o GTM carregam.
- Depois disso, o botão "Testar" do Google deve detectar a tag.

### 3. Próximo passo (depois, quando você quiser)
- Criar os rótulos de conversão no painel do Google Ads (ex: cadastro concluído, compra) e me enviar — eu conecto aos eventos do app com a função `trackGoogleAdsConversion` que já está pronta.

## Detalhes técnicos
- Nenhuma mudança de código necessária — a instalação já foi feita e validada na v0.8.2.
- Apenas publicação + verificação no domínio de produção.
