## Objetivo

Criar uma experiência de entrada estilo app mobile: sem landing longa, vai direto para login/criar conta com Google como opção principal. Mantém a landing atual para acesso desktop/web marketing, mas detecta mobile e direciona para a nova entrada.

## O que será feito

### 1. Nova página `/app` — entrada mobile-first
- Tela cheia, mobile-first (funciona bem em desktop também).
- Logo CloseFlow no topo, tagline curta (1 linha).
- Botão primário: **Continuar com Google**.
- Divisor "ou".
- Campos email + senha com tabs/toggle entre "Entrar" e "Criar conta".
- Link "Esqueci minha senha".
- Footer minúsculo com links legais (termos/privacidade).
- Sem hero, sem features, sem pricing — direto ao ponto.

### 2. Google Sign-In (Lovable Cloud Managed)
- Habilitar provider Google via `configure_social_auth`.
- Usar `lovable.auth.signInWithOAuth("google", ...)`.
- Após login bem-sucedido, redirecionar para `/dashboard` (ou `/onboarding` se primeiro acesso — já existe lógica de primeiro usuário virar admin).

### 3. Roteamento inteligente
- Em `/` (Landing atual): detectar user-agent mobile → redirect automático para `/app`.
- Desktop continua vendo a landing completa.
- Usuário já autenticado em `/app` → redireciona para `/dashboard`.
- Adicionar `/app` como rota pública no `App.tsx`.

### 4. Manifest PWA (instalável)
- Adicionar `public/manifest.webmanifest` com `display: standalone`, theme color, nome CloseFlow.
- Ícones 192/512 (gerar via imagegen, fundo da marca).
- Tags `<link rel="manifest">`, `<meta name="theme-color">`, `apple-touch-icon` no `index.html`.
- **Sem service worker** (sem offline) — só home-screen install. Quando migrar para Capacitor/Dreamflow no futuro, esse manifest já ajuda.

### 5. i18n
- Novas strings em `pt-BR/auth.json` e `en/auth.json` para tela de entrada mobile.

### 6. Atualizar roadmap e QA checklist no admin
- Marcar "Entrada mobile-first" e "Google Sign-In" como entregues.

## Detalhes técnicos

- **Arquivos novos**: `src/pages/MobileEntry.tsx`, `public/manifest.webmanifest`, `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`.
- **Editados**: `src/App.tsx` (rota `/app`), `src/pages/Landing.tsx` (redirect mobile via `useEffect` + `navigator.userAgent`), `index.html` (manifest + meta tags), locales i18n, `AdminRoadmap.tsx`, `AdminQAChecklist.tsx`.
- **Backend**: `configure_social_auth` com `providers: ["google"]` (mantém email habilitado).
- **Auth flow**: usar `lovable.auth.signInWithOAuth` (managed); email/senha continua via `supabase.auth.signInWithPassword` / `signUp` como hoje.

## Fora do escopo (próximos passos)

- Capacitor / build nativo iOS/Android (você mencionou Dreamflow no futuro).
- Service worker offline.
- Push notifications nativas.
- Onboarding visual de 4 passos pós-signup (fica para próxima iteração se quiser).
