
# Plano: Orca na Google Play Store (v1.0 mobile)

## Decisões confirmadas
- **Loja**: Android primeiro (Play Store). iOS fica para uma onda posterior.
- **Pagamentos mobile**: Híbrido com **RevenueCat** (Stripe na web + Google Play Billing no app).
- **Publisher**: Empresa / MEI (CNPJ).

## Visão geral em fases

```text
Fase 0 — Pré-requisitos burocráticos (você)
Fase 1 — Empacotamento Capacitor + branding nativo
Fase 2 — Polimento UX mobile (ajustes pré-loja)
Fase 3 — RevenueCat + Google Play Billing
Fase 4 — Assets de loja + privacidade + compliance
Fase 5 — Build assinado + faixa de teste interno
Fase 6 — Teste fechado (14 dias / 12 testers) → Produção
```

---

## Fase 0 — O que você precisa providenciar (fora do código)

Eu não consigo abrir nada disso por você, então essa lista é sua:

1. **CNPJ do MEI ativo** com comprovante.
2. **Conta Google Play Console** (US$ 25, pagamento único) — registrar como **organização** usando o CNPJ.
   - Google vai pedir verificação D-U-N-S (gratuito via Dun & Bradstreet, 7–14 dias).
3. **Cartão internacional** habilitado para a taxa de US$ 25 e para receber pagamentos (configurar Merchant Account no Play Console).
4. **Conta no RevenueCat** (grátis até US$ 2.5k MTR) — https://www.revenuecat.com.
5. **Mac com Xcode** — **não precisa agora** (é só para iOS, fase futura).

Posso seguir construindo o app sem nada disso. Você roda em paralelo.

---

## Fase 1 — Empacotamento Capacitor

**Objetivo**: gerar projeto Android nativo a partir do React.

- Adicionar dependências: `@capacitor/core`, `@capacitor/cli` (dev), `@capacitor/android`.
- Criar `capacitor.config.ts` na raiz com:
  - `appId`: `app.orca.mento` (precisa decidir — sugiro este, é o que vai aparecer pra sempre na Play Store).
  - `appName`: `Orca`.
  - `webDir`: `dist`.
  - **Não** colocar `server.url` apontando pro sandbox no build final (só pra dev).
- Configurar splash screen e ícone adaptativo Android com a orquinha.
- Gerar todos os tamanhos de ícone (mipmap-mdpi até xxxhdpi + ícone adaptativo monocromático Android 13+) a partir de `src/assets/brand/`.
- Configurar `StatusBar` (cor `#0F172A` — slate da paleta).
- Configurar deep links: `https://orca-mento.app/*` abre no app (Asset Links).

**Sua ação**: depois que eu criar a config, você roda localmente:
```bash
npm install
npx cap add android
npx cap sync
npx cap open android   # abre Android Studio
```

---

## Fase 2 — Polimento UX mobile pré-loja

Apps web-view simples são reprovados pela Google por "low quality". Ajustes:

- Garantir que **toda navegação principal** funciona offline minimamente (mostrar tela de "sem conexão" educada, não tela branca).
- Botão de voltar Android nativo respeitado (`App.addListener('backButton', ...)`).
- Esconder/desabilitar UI de "Stripe checkout" e "Upgrade no site" quando rodando no app Android — substituir por **paywall RevenueCat** (Fase 3).
- Texto legal "Termos / Privacidade" acessível em até 2 cliques (já temos `/legal/*`).
- Esconder o link "Editar com Lovable" badge no build de produção.

---

## Fase 3 — RevenueCat + Google Play Billing

**Por que RevenueCat**: unifica Stripe (web) + Google Play Billing (Android) + futuramente Apple IAP (iOS) num único sistema de "entitlements". Webhook entrega para nosso backend Cloud quem é Pro/Business.

**Setup**:
1. Criar produtos no **Google Play Console → Monetize → Subscriptions**:
   - `orca_pro_monthly`, `orca_pro_yearly`, `orca_business_monthly`, `orca_business_yearly`.
   - Preços em BRL.
2. Linkar Play Console ↔ RevenueCat (service account JSON).
3. No app, instalar `@revenuecat/purchases-capacitor`.
4. Criar `MobilePaywall.tsx` que substitui `/pricing` quando `Capacitor.isNativePlatform()`.
5. Edge function `revenuecat-webhook` recebe eventos (compra, renovação, cancelamento) e atualiza `user_plan` no banco — fonte única da verdade.
6. Stripe webhook (que já existe) também alimenta o mesmo `user_plan` — RevenueCat aceita Stripe como provider externo, mantendo entitlements unificados.

**Importante**: Apple/Google **proíbem** mostrar preço da web ou linkar pro site para pagar dentro do app. Vou esconder esses elementos no build mobile.

---

## Fase 4 — Assets de loja + compliance

Eu gero (você revisa):
- **Ícone Play Store**: 512x512 PNG (orquinha sobre slate).
- **Feature graphic**: 1024x500 (orquinha + tagline "Crie propostas em minutos").
- **Screenshots**: 6 telas mobile da Orca em pt-BR (dashboard, nova proposta, lista, link público, etc.) em 1080x1920.
- **Descrição curta** (80 char) e **longa** (4000 char) em pt-BR — aproveitar `docs/marketing/app-description-pt.md`.
- **Política de Privacidade pública**: já existe em `https://orca-mento.app/legal/privacy` ✅.
- **Termos**: `https://orca-mento.app/legal/terms` ✅.
- **Email de suporte**: precisamos definir (sugestão: `suporte@orca-mento.app` — você configura no domínio).

Você preenche no Play Console:
- **Data Safety form**: declarar coleta de email, nome, dados de propostas (criptografados em trânsito + repouso).
- **Classificação etária**: questionário IARC (vai dar "Livre").
- **Categoria**: Produtividade ou Negócios.
- **Público-alvo**: 18+.

---

## Fase 5 — Build assinado + faixa de teste interno

1. Gerar **keystore** no Android Studio (`orca-release.jks`) — **guardar com a vida**, perdeu = nunca mais atualiza o app.
2. Configurar `android/app/build.gradle` com signing config.
3. Build `.aab` (Android App Bundle): `./gradlew bundleRelease`.
4. Upload no Play Console → **Testes internos** (até 100 testers, libera em ~hora).
5. Convidar 2-3 pessoas (você + 1-2 amigos) pra instalar.

---

## Fase 6 — Teste fechado → Produção

Google exige (contas novas, regra de 2023):
- **14 dias** mínimo em **teste fechado** com **12+ testers ativos** antes de poder publicar em produção.
- Recrutar via formulário ou grupo do WhatsApp (sugiro: pedir pra 15 pessoas, esperar 12 instalarem).
- Após o período, requisitar revisão de produção → review humana de 1-7 dias → **app no ar**.

---

## Roadmap atualizado

Adicionar nova onda no `docs/ROADMAP.md`:

| Onda | Versão | Tema | Status |
|------|--------|------|--------|
| 6    | v0.6.0 | **Mobile Android (Play Store) + RevenueCat** | ⏳ Próxima |

Vai bumpar o `package.json` para `0.6.0` no final.

---

## Detalhes técnicos (seção pra dev)

**Arquivos que vou criar/editar (ordem)**:
- `capacitor.config.ts` (raiz)
- `package.json` (deps Capacitor + RevenueCat)
- `src/lib/platform.ts` — helper `isNativeMobile()`
- `src/pages/MobilePaywall.tsx` — novo
- `src/pages/Pricing.tsx` — redirect pra MobilePaywall em native
- `src/hooks/useRevenueCat.ts` — init + login com user.id
- `src/main.tsx` — bootstrap RevenueCat só em native
- `supabase/functions/revenuecat-webhook/index.ts` — novo
- `supabase/config.toml` — registrar webhook (`verify_jwt = false`)
- `supabase/migrations/<timestamp>_revenuecat_events.sql` — tabela de auditoria
- `android/` — gerado pelo `npx cap add android` (você roda)
- `public/.well-known/assetlinks.json` — para deep links
- `docs/releases/v0.6.0-mobile.md`
- `docs/ROADMAP.md` + `package.json` (bump 0.6.0)

**Pontos críticos**:
- `RC_API_KEY` (público Android) vai como `import.meta.env` — é chave pública, ok no bundle.
- `RC_WEBHOOK_SECRET` via `add_secret` para validar assinatura HMAC do webhook.
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` fica **no RevenueCat**, não no nosso backend.
- Stripe continua funcionando 100% na web sem alteração.

**Riscos / o que pode dar errado**:
- D-U-N-S demora — começa hoje.
- Política de Privacidade tem que mencionar **especificamente** RevenueCat e Google Play Billing — vou atualizar o conteúdo de `legal.json` no namespace `privacy`.
- Se o appId mudar depois do primeiro publish, é um app novo. Decidir `app.orca.mento` agora e nunca mais mexer.

---

## O que NÃO está neste plano (fica pra depois)

- iOS / App Store (Fase 7, requer Mac + Apple Developer Program US$ 99/ano + Sign in with Apple).
- Push notifications nativas (Firebase Cloud Messaging) — posso adicionar se quiser, mas não é requisito de loja.
- Widgets / quick actions Android.

---

**Próximo passo se aprovar**: aceito o plano e começo pela Fase 1 (Capacitor + branding nativo). Em paralelo, você abre conta Google Play Console + RevenueCat.
