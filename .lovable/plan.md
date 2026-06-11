# Fase 2 — Polimento UX mobile (pré-loja)

Objetivo: deixar o app pronto pra rodar dentro do wrapper Android Capacitor sem cair em armadilhas comuns de reprovação ("webview pelada", links pra pagamento externo, botão voltar quebrado, tela branca offline).

Tudo é frontend. Sem mexer em banco, edge functions ou Stripe web.

---

## 1. Helper central de "estou no app nativo?"

Hoje só temos `isNativeMobile()` em `src/lib/platform.ts`. Vou adicionar um hook fininho:

- `src/hooks/useIsNative.ts` → `useIsNative(): boolean` (estado reativo, fica `true` no Android/iOS).

Assim qualquer componente pode esconder UI condicionalmente sem importar o helper direto e sem riscos de SSR.

---

## 2. Esconder "Stripe / Upgrade pelo site" no build nativo

Regra de loja: app não pode oferecer pagamento por fora do Google Play Billing.

Locais a tratar (sem remover nada da web):

- `src/components/UpgradeModal.tsx` → no nativo, esconder CTA que abre Stripe Checkout e mostrar botão "Ver planos" que vai pra `/pricing` (que já é trocado por `MobilePaywall` quando nativo).
- `src/components/UsageIndicator.tsx` → mesma troca de CTA.
- `src/pages/Landing.tsx` → no nativo, esconder seção de pricing com preços e botão "Assinar" (Landing é improvável de aparecer no app, mas blindamos).
- `src/pages/admin/integrations/StripeIntegrationCard.tsx` e qualquer link de portal de billing no `SettingsPage` → no nativo, mostrar aviso "Gerencie sua assinatura pelo Google Play" em vez do botão.
- Footer / sidebar: remover link externo "Site" / "Planos web" no nativo.

Resultado: nenhuma rota visível no app menciona preço externo nem abre `checkout.stripe.com`.

---

## 3. Botão voltar nativo do Android

Sem isso, o Android fecha o app ao apertar voltar na home — reprovação comum.

- Em `src/App.tsx` (ou um `NativeBackHandler` ao lado do `NativeBoot`):
  - Importar `App` do `@capacitor/app` dinamicamente quando `isNativeMobile()`.
  - Listener `backButton`: se `history.length > 1` → `history.back()`; senão → `App.exitApp()`.
  - Limpar listener no unmount.

Sem dependência nova (`@capacitor/app` já vem com Capacitor core ecosystem; se faltar, adicionar `@capacitor/app`).

---

## 4. Tela "sem conexão" decente (sem service worker)

Não vamos implementar PWA offline — só evitar tela branca quando o usuário abre o app sem net.

- `src/components/OfflineBanner.tsx`: escuta `navigator.onLine` + eventos `online`/`offline`. Quando offline, mostra banner fixo no topo "Sem conexão — algumas funções podem não funcionar".
- Montar dentro de `AppLayout`.
- ErrorBoundary global em `App.tsx` que, se a primeira renderização falhar por fetch, mostra tela de "Tente novamente" em vez de branco. Reusar `NotFound` como base visual.

---

## 5. Esconder badge "Editar com Lovable" no build de produção

Vou chamar `publish_settings--set_badge_visibility({ hide_badge: true })` (requer Pro). Se não puder, registro no plano que o usuário precisa ativar manualmente.

---

## 6. Status bar e safe-area no Android

Já temos cor da status bar no `main.tsx`. Falta:

- `index.html`: meta `viewport-fit=cover`.
- `src/index.css`: adicionar utilitários `pt-safe`, `pb-safe` usando `env(safe-area-inset-*)` e aplicar no `AppLayout` (header + bottom nav, se existir).

---

## 7. Links externos viram in-app browser

Qualquer `<a target="_blank">` no app nativo precisa abrir no navegador in-app (`@capacitor/browser`) ou bloquear. Vou:

- Criar `src/lib/openExternal.ts` que, no nativo, usa `Browser.open({ url })`; na web, faz `window.open`.
- Trocar pontos óbvios: footer legal, links de marketplace/integrações no `SettingsPage`, links de docs.

Adiciona dep: `@capacitor/browser` (e `@capacitor/app` se faltar).

---

## 8. Smoke test no preview web

Após cada bloco, abrir o preview e conferir que **na web nada mudou** (todos os guards são `if (isNative)`).

---

## Arquivos que vou criar/editar

Criar:
- `src/hooks/useIsNative.ts`
- `src/components/OfflineBanner.tsx`
- `src/components/NativeBackHandler.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/lib/openExternal.ts`

Editar:
- `src/App.tsx` (montar NativeBackHandler + ErrorBoundary)
- `src/components/AppLayout.tsx` (OfflineBanner + safe-area)
- `src/components/UpgradeModal.tsx`
- `src/components/UsageIndicator.tsx`
- `src/pages/Landing.tsx`
- `src/pages/admin/integrations/StripeIntegrationCard.tsx`
- `src/pages/settings/SettingsPage.tsx`
- `src/index.css` (safe-area utils)
- `index.html` (viewport-fit=cover)
- `package.json` (`@capacitor/app`, `@capacitor/browser`)

Ações fora do código:
- Esconder badge Lovable via tool (requer Pro).

---

## O que NÃO entra nesta fase

- RevenueCat paywall funcional (Fase 3).
- Assets de loja, descrição, screenshots (Fase 4).
- Build assinado `.aab` (Fase 5 — você roda local com Android Studio).
- Service worker / PWA offline real.
- Push notifications.

---

**Se aprovar, começo pelo bloco 1 → 4 (helper, esconder Stripe, back button, offline banner) e depois 5 → 7.**
