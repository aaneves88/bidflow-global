# O que falta desenvolver antes do build Android

Hoje **já temos** login social no código — o botão "Continuar com Google" existe em `MobileEntry.tsx` usando `lovable.auth.signInWithOAuth('google', …)`. Isso funciona bem no **web/PWA**, mas dentro do **APK Android** o fluxo precisa de ajustes (deep link de retorno), e há outros pontos pequenos para o app ficar pronto pra Play Store.

## 1. Login social no app nativo (ajuste, não criação)

O `signInWithOAuth` abre o navegador para o Google. No APK isso vira "abriu Chrome e nunca volta pro app". Precisamos:

- Configurar **App Links / deep link** `app.orca.mento://auth-callback` no `AndroidManifest.xml`
- Tratar o retorno com `@capacitor/app` (`appUrlOpen`) e fazer `supabase.auth.exchangeCodeForSession`
- Passar `redirect_uri` correto quando `isNativeMobile()`
- O `assetlinks.json` (já existe vazio em `public/.well-known/`) precisa ser preenchido com o SHA-256 do keystore depois do build

**Alternativa mais simples:** usar `@capacitor/browser` em modo in-app e capturar o retorno via deep link — é o padrão recomendado pela Supabase para Capacitor.

## 2. Tela de paywall mobile (`MobilePaywall.tsx`)

Existe mas precisa ser finalizada:
- Buscar `Offerings` do RevenueCat (`Purchases.getOfferings()`)
- Renderizar pacotes com preço já localizado (RC retorna `priceString`)
- `Purchases.purchasePackage(pkg)` no clique
- Tratar estados: loading, erro, "já assinante", restaurar compras
- Botão **"Restaurar compras"** (obrigatório pela Play Store)

## 3. Webhook RevenueCat → Lovable Cloud

A edge function `revenuecat-webhook` existe. Falta:
- Confirmar que valida `Authorization: Bearer <RC_WEBHOOK_SECRET>`
- Mapear eventos (`INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`) para `user_plans.status`
- Resolver `app_user_id` (= `user.id`) e `product_id` → `plans.metadata.rc_product_id`
- O secret `RC_WEBHOOK_SECRET` ainda não foi adicionado

## 4. Telas obrigatórias para a Play Store

- **Excluir conta** dentro do app (Google exige desde 2024 para qualquer app com login): botão em `SettingsPage` → edge function que apaga `auth.users` via service role
- Links visíveis para **Termos** e **Privacidade** (já existem as páginas, só garantir link no menu mobile)
- Tela ou modal de **gerenciar assinatura** (link `Purchases.showManageSubscriptions()` no Android)

## 5. Ajustes nativos pequenos

- `capacitor.config.ts`: confirmar que o bloco `server { url }` está comentado antes do build de produção
- Ícones adaptativos (foreground + background) — gerados a partir do `orca-mark.png` via `@capacitor/assets`
- Splash screen 2732x2732 a partir da marca
- `versionCode` / `versionName` no `build.gradle`

## 6. Fase 4 — assets de loja (paralelo, não-código)

- Ícone 512x512
- Feature graphic 1024x500
- 6 screenshots 1080x1920 (com molduras)
- Descrição curta (80 char) e longa (4000 char) em pt-BR — `docs/marketing/app-description-pt.md` já tem rascunho

---

## Ordem sugerida de implementação

1. **Excluir conta** (bloqueia publicação se faltar)
2. **Deep link + login Google nativo**
3. **MobilePaywall** completa + botão restaurar
4. **Webhook RevenueCat** (validar + mapear)
5. **Ícones/splash adaptativos** via `@capacitor/assets`
6. **Assets de loja** (Fase 4)

Itens 1–5 são código (eu faço). Item 6 é geração de imagens + textos.

**Quer que eu comece pelo item 1 (excluir conta) e 2 (deep link Google nativo)?** São os dois maiores bloqueadores para a Play Store aceitar.
