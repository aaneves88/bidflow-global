# Tag do Google no ar: deixar a medição confiável

## Resposta à sua pergunta

Sim — a tag que você colou já está criada e **está funcionando no site publicado**. Acabei de conferir no `orca-mento.app`:

- O script do Google (`gtag/js?id=AW-18401533293`) carrega.
- O aviso de página do Google Ads (`pagead/viewthroughconversion/18401533293`) dispara — ou seja, a conta certa está recebendo.
- O Tag Manager (`GTM-TZHKGXJ4`) e o pixel do Facebook também estão carregando.

Encontrei três ajustes que valem a pena antes de qualquer campanha gastar dinheiro.

## O que a verificação revelou

1. **O Tag Manager tem uma tag do Google com o ID errado.** Ela aparece como `AW-AW-18401533293` (o "AW-" duplicado). É pedido de digitação na hora de criar a tag no painel — esse formato não existe e o Google descarta o que ela envia.
2. **A tag está vindo de dois lugares ao mesmo tempo:** de dentro do Tag Manager e do código do app. Hoje o código percebe que o Tag Manager já carregou a tag e desiste — o que evita cópia dupla, mas gera o problema abaixo.
3. **O disparo de conversões está morto por enquanto.** Como o código desistiu de iniciar, a função que usa para registrar conversões (`trackGoogleAdsConversion`) não encontra o comando `gtag` na página e **não faz nada em silêncio**. Quando você criar os rótulos de conversão, nada seria enviado. Isso precisa ser corrigido antes.

## O que será feito

### 1. O código passa a ser o dono da tag (confiável em qualquer estado)
Ajustar `src/lib/googleAds.ts` para que, sempre em produção:
- o comando `gtag` e a fila `dataLayer` existam no navegador, mesmo que o Tag Manager tenha chegado antes;
- a configuração da conta `AW-18401533293` seja enviada de verdade;
- o script do Google só seja baixado pelo app se ninguém (Tag Manager ou o próprio app) já tiver baixado — sem nunca carregar duas cópias;
- o disparo de conversão escreva direto na fila do Google se o comando `gtag` não estiver disponível, em vez de sumir.

Resultado: a tag funciona tanto no estado de hoje (Tag Manager ainda com a tag) quanto depois da limpeza.

### 2. Limpeza no painel do Tag Manager (ação sua, 2 minutos)
Instruções prontas no final: abrir o contêiner `GTM-TZHKGXJ4`, ir em **Tags**, e apagar as tags do tipo "Google Ads" — inclusive a `AW-AW-18401533293`. O contêiner do Tag Manager continua instalado no site (continua servindo para outras tags); só a tag do Google sai de lá, porque passa a ser carregada pelo app.

Sem isso, há risco de o mesmo visitante ser contado duas vezes quando os dois carregarem.

### 3. Publicar e re-verificar
Publicar, abrir o site publicado e conferir: uma única cópia da tag da conta certa, comando `gtag` disponível, nenhum pedido com `AW-AW-`, e a fila de dados do Google ativa.

### 4. Registrar o que fica pendente
- **Consentimento:** você escolheu decidir depois. Deixo como está (medindo em todos os lugares) e registro no roadmap que a definição está pendente — dá para ativar um aviso regional ou bloqueio por país quando quiser.
- **Rótulos de conversão:** ainda não existem no Google Ads, então hoje a conta só vê visitas, sem meta de compra/cadastro. Enquanto não houver um rótulo criado, o Google não tem o que otimizar. Quando você criar (recomendo começar por "cadastro concluído"), eu conecto ao app em minutos.

### 5. Documentar
Nota de release (v0.8.3) e linha no roadmap, no padrão que já usamos.

## Instruções para o painel do Tag Manager

1. Acesse `https://tagmanager.google.com` com a conta Google que criou o contêiner.
2. Escolha o contêiner **GTM-TZHKGXJ4**.
3. Menu **Tags**: localize as tags de "Google Ads" (uma delas com ID `AW-AW-18401533293`).
4. Exclua as duas. Não é preciso tocar em "Google Tag Manager" em si nem em nenhuma outra tag.
5. **Publicar** a versão do contêiner.

## Detalhes técnicos

- `src/lib/googleAds.ts`: a guarda de duplicação passa a reconhecer cópias próprias (atributo `data-orca-ads`) e a ignorar as alheias; `window.gtag` e `window.dataLayer` são garantidos antes de qualquer `config`; `trackGoogleAdsConversion` faz `dataLayer.push(['event','conversion',{send_to,...}])` quando `window.gtag` não é função.
- `index.html`: nenhum mudança — o contêiner do Tag Manager e o pixel do Facebook ficam como estão.
- Nenhuma mudança de banco, autenticação ou rotas.
- Checagem final com navegador automatizado no domínio de produção, mais `tsc --noEmit` e build.
- Persistir em docs: rota de consentimento pendente; ausência de rótulo de conversão biddable antes de criar campanha.
