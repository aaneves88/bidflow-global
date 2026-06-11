# Fase 5 — Gerar o `.aab` e subir na Play Console

Este passo é **local na sua máquina** (Lovable não compila APK/AAB). Tempo estimado: ~2h na primeira vez, ~10min nas próximas.

> Pré-requisitos: macOS, Linux ou Windows; **Node 20+**, **Java 17 (JDK)**, **Android Studio** (Hedgehog ou mais novo).

---

## 1. Trazer o código pra sua máquina

No editor Lovable: **GitHub → Connect to GitHub** (se ainda não fez) → **Push to GitHub**. Depois:

```bash
git clone git@github.com:<seu-user>/<seu-repo>.git orca
cd orca
npm install
```

> Se aparecer `bun.lock`, pode usar `bun install` no lugar — tanto faz.

---

## 2. Criar `.env.production` com a chave pública do RevenueCat

Na raiz do projeto, crie um arquivo `.env.production`:

```bash
VITE_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxxxxxxxxxxx
```

Pegue o valor em **RevenueCat → Project Settings → API keys → Public Android SDK key**.

> Essa chave é **pública** (vai dentro do bundle do app). O segredo de verdade é o `RC_WEBHOOK_SECRET`, que fica só no backend.

---

## 3. Build web + adicionar plataforma Android

```bash
npm run build           # gera /dist
npx cap add android     # cria /android (só na primeira vez)
npx cap sync android    # copia /dist e plugins pra dentro de /android
```

A partir daqui existe a pasta `android/` na raiz — **commit ela no repo** (Capacitor recomenda).

---

## 4. Configurar ícone, splash, nome no Android Studio

```bash
npx cap open android
```

No Android Studio:

1. **Ícone do app** — botão direito em `app/src/main/res` → **New → Image Asset** → escolher `src/assets/brand/orca-mark-v3.png` como Foreground, fundo `#0F172A`. Aplica os adaptive icons em todos os DPIs.
2. **Nome do app** — `android/app/src/main/res/values/strings.xml` → confirmar `<string name="app_name">Orca</string>`.
3. **Versão** — `android/app/build.gradle` → `versionCode 1`, `versionName "0.6.0"`. A cada release novo, **incrementa o `versionCode`** (a Play não aceita o mesmo número duas vezes).

---

## 5. Criar o keystore (uma vez na vida)

> **⚠️ Esse arquivo é a alma do app.** Se perder, você nunca mais consegue atualizar ele na Play. Faça backup em 2 lugares (1Password + HD externo).

```bash
keytool -genkey -v -keystore ~/keys/orca-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias orca
```

Guarde a **senha do keystore** e a **senha do alias** — vão ser pedidas em todo build.

---

## 6. Configurar assinatura no Gradle

Crie `android/keystore.properties` (e adicione no `.gitignore`):

```properties
storeFile=/Users/voce/keys/orca-release.jks
storePassword=SENHA_DO_KEYSTORE
keyAlias=orca
keyPassword=SENHA_DO_ALIAS
```

Edite `android/app/build.gradle` — adicione antes do bloco `android { ... }`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

E dentro de `android { ... }`:

```gradle
signingConfigs {
    release {
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
    }
}
```

---

## 7. Gerar o `.aab` (release bundle)

No Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle → release**.

Ou via terminal:

```bash
cd android
./gradlew bundleRelease
```

O arquivo sai em: `android/app/build/outputs/bundle/release/app-release.aab`.

Esse é o arquivo que vai pra Play Console.

---

## 8. Conta Google Play Console

1. **Criar conta** em [play.google.com/console](https://play.google.com/console) → escolher **Organization** → pagar **US$ 25** (taxa única).
2. Verificação **D-U-N-S** com o CNPJ do MEI — **leva ~14 dias**, é gratuita (não cair em golpe de site cobrando US$ 200). Solicitar em [dnb.com.br](https://www.dnb.com.br).
3. Criar app `Orca` → `applicationId = app.orca.mento`.

---

## 9. Criar os produtos de assinatura na Play

Em **Monetize → Products → Subscriptions**, criar:

| Product ID                  | Período | Preço sugerido (BRL) |
| --------------------------- | ------- | -------------------- |
| `orca_pro_monthly`          | mensal  | R$ 39,90             |
| `orca_pro_yearly`           | anual   | R$ 383,00 (−20%)     |
| `orca_business_monthly`     | mensal  | R$ 89,90             |
| `orca_business_yearly`      | anual   | R$ 863,00 (−20%)     |

Depois, no admin da Orca, em cada **Plan**, gravar o `product_id` em `metadata.rc_product_id` para o webhook conseguir reconciliar.

---

## 10. Asset Links (deep link `orca-mento.app/p/...` abrir no app)

Na Play Console: **Setup → App integrity → App signing key certificate** → copiar o **SHA-256 fingerprint**.

Editar `public/.well-known/assetlinks.json` na raiz do projeto:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "app.orca.mento",
    "sha256_cert_fingerprints": ["XX:XX:XX:..."]
  }
}]
```

Republicar a web (Lovable Publish) e validar em:
`https://orca-mento.app/.well-known/assetlinks.json`

---

## 11. RevenueCat — última conexão

1. RevenueCat → **App** → conectar **Play Console Service Account** (JSON).
2. Criar **Offerings** → adicionar os 4 packages criados no passo 9.
3. **Integrations → Webhooks** → URL do webhook + Authorization: `Bearer <RC_WEBHOOK_SECRET>`.

---

## 12. Subir o `.aab` e teste fechado

Play Console → **Testing → Closed testing** → criar track → upload do `app-release.aab` → adicionar **12+ testers reais** (emails Google).

> A Google **exige 12 testers ativos por 14 dias** antes de liberar produção pra contas novas. Adicione amigos/clientes-piloto cedo.

Preencher também:
- **Data safety form** (declarar coleta de email, nome, dados de pagamento via Google Play).
- **Content rating** (questionário, ~5min, sai "Livre").
- **Target audience** (18+, sem direcionamento a crianças).
- **Privacy policy URL** → apontar pra `orca-mento.app/legal/privacy`.

---

## 13. Promover pra produção

Depois dos 14 dias de teste fechado:

Play Console → **Production → Create new release** → promover o bundle do teste fechado → submeter pra review (~3-7 dias).

---

## Atualizações futuras (release N+1)

```bash
git pull
npm install
npm run build
npx cap sync android
# bump versionCode em android/app/build.gradle
cd android && ./gradlew bundleRelease
# upload do novo .aab em Production → Create new release
```

E está feito.

---

## Checklist final antes de submeter

- [ ] `versionCode` incrementado
- [ ] `.aab` assinado com o keystore de produção
- [ ] `assetlinks.json` com o SHA-256 correto publicado em `orca-mento.app`
- [ ] `VITE_REVENUECAT_ANDROID_KEY` no `.env.production`
- [ ] `RC_WEBHOOK_SECRET` configurado no Lovable Cloud
- [ ] Produtos criados na Play Console e mapeados em `plans.metadata.rc_product_id`
- [ ] Webhook RevenueCat respondendo 200 (testar com evento de sandbox)
- [ ] Política de privacidade e termos acessíveis em `orca-mento.app/legal/*`
- [ ] 12+ testers no closed testing
