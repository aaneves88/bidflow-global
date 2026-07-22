# Avaliação de lançamento — Orca

Análise como product lead do que falta para o **lançamento comercial oficial** (v1.0.0), com base no roadmap atual, no estado do código e nas ondas já entregues (v0.1 → v0.6).

---

## 1. Status atual (o que já está pronto)

- ✅ CRM base: clientes, propostas, status, link público, assinatura digital
- ✅ Identidade Orca + i18n pt-BR/en
- ✅ Planos (Free/Premium), limites, watermark, PDF híbrido
- ✅ Segurança: RLS em todas as tabelas, RPC público, HIBP, hardening
- ✅ E-mails transacionais brandados (auth + 6 eventos de proposta) via notify.orca-mento.app
- ✅ Base mobile Android: Capacitor + RevenueCat + webhook + paywall nativo
- ✅ Landing page com conversão + pricing simplificado (Free / Premium R$29)
- ✅ Stripe payment link em produção + upgrade modal
- ✅ Página de Privacidade + `/account` com Danger Zone (delete-account)
- ✅ Admin: usuários, planos, status, integrações, roadmap, QA checklist, conceder Premium cortesia
- ✅ PWA manifest + service worker

---

## 2. Bloqueios críticos para lançar (P0 — precisa antes de anunciar)

### 2.1 Legal & Compliance (LGPD)
- **Termos de Uso** — só há Privacidade; sem Termos, não pode cobrar legalmente no Brasil
- **Consentimento de cookies** (banner LGPD) — obrigatório com Analytics/tracking
- Revisar Privacidade contra requisitos da Play Store (Data Safety) e do Stripe
- Link "Cancelar assinatura" claro no `/account` (exigência Stripe + LGPD)

### 2.2 Pagamentos web em produção
- Stripe hoje é **Payment Link** simples — falta:
  - Webhook Stripe reconciliando `user_plans` no evento `checkout.session.completed` e `customer.subscription.deleted`
  - Fluxo de cancelamento (portal do cliente Stripe) dentro do app
  - Plano Anual (R$ 239,90) ainda não existe como produto Stripe conectado
  - Recuperação de pagamento falho (dunning)
- **Sem isso**: usuário paga, mas plano não ativa automaticamente hoje sem intervenção manual.

### 2.3 Auth hardening
- **Login social (Google)** ainda desligado na web também? Confirmar. Sem Google login, conversão do onboarding sofre ~30-40%
- **Recuperação de senha** — templates existem, mas testar ponta-a-ponta em produção
- **Confirmação de e-mail obrigatória** — decidir se será enforced

### 2.4 Observabilidade mínima
- **Analytics de produto** (PostHog ou Plausible) — hoje voando cego pós-lançamento
- **Error monitoring** (Sentry) — ErrorBoundary existe mas não reporta
- **Canal de suporte** — e-mail `suporte@orca-mento.app` ou widget de chat (Crisp/Intercom)

---

## 3. Alto valor pré-lançamento (P1 — muito recomendado)

### 3.1 Onboarding
- Fluxo guiado pós-signup: preencher branding → criar primeiro cliente → criar primeira proposta (existe `useOnboardingGate` mas confirmar completude)
- Empty states com CTA em Dashboard/Clientes/Propostas
- E-mail de welcome com "3 primeiros passos"

### 3.2 Landing & SEO
- Landing tem seções, mas falta:
  - **Prova social**: 3-5 depoimentos reais (mesmo que beta testers)
  - **FAQ** (objeções: "posso cancelar?", "meus dados são seguros?", "funciona sem internet?")
  - **Blog / SEO** — pelo menos 3 posts âncora (ex: "como fazer proposta comercial", "modelo de orçamento freelancer")
  - Open Graph image customizada
  - Sitemap.xml + robots.txt revisados

### 3.3 Retenção
- **Notificações in-app** (`NotificationsBell` existe — validar se está ligada aos eventos certos)
- **Digest semanal** por e-mail: "Você tem X propostas visualizadas mas não respondidas"
- Reengajamento de usuários inativos (D+7, D+30)

---

## 4. Mobile Android — para submeter na Play (P0 se for lançar mobile junto)

Se o lançamento inclui Play Store:
- Testes com 12+ testers por 14 dias (exigência Google para contas novas) — **iniciar já**
- Assets de loja: ícone 512x512, feature graphic 1024x500, 6 screenshots pt-BR
- Descrição longa + short description em pt-BR
- Data Safety form preenchido
- Content Rating
- Verificação D-U-N-S concluída (~14 dias)
- `assetlinks.json` com SHA-256 real do keystore de produção
- Produtos Play Console criados + `plans.metadata.rc_product_id` preenchido

**Recomendação**: lançar **web primeiro** (2-3 semanas), Android como onda seguinte (4-6 semanas depois).

---

## 5. Nice-to-have pós-lançamento (P2 — pode esperar)

- iOS / App Store (Onda 7)
- Painel admin com métricas avançadas (MRR, churn, funil) — Onda 8
- Integração WhatsApp Business (aparece em "Em breve" na tela de integrações)
- Templates de proposta reutilizáveis
- Duplicar proposta
- Multi-usuário / equipes
- Modo escuro
- Exportação de dados (LGPD dá direito, mas admin pode fazer manual no início)

---

## 6. Roadmap sugerido até v1.0.0

```text
Onda 7  → v0.7.0  Stripe completo (webhook + portal + anual)     [1 semana]
Onda 8  → v0.8.0  LGPD (Termos + cookies + revisão privacidade)  [3-4 dias]
Onda 9  → v0.9.0  Observabilidade (Sentry + PostHog + suporte)   [2-3 dias]
Onda 10 → v0.10.0 Onboarding polido + SEO/FAQ/depoimentos        [1 semana]
Onda 11 → v1.0.0  🚀 Lançamento comercial web
Onda 12 → v1.1.0  Android na Play Store (após 14 dias closed test)
```

**Total estimado até v1.0.0 web: 3-4 semanas de trabalho focado.**

---

## 7. Perguntas para você decidir antes do próximo passo

1. **Escopo do lançamento**: web-only primeiro, ou web + Android simultâneos?
2. **Data-alvo**: existe uma data comprometida (evento, campanha)?
3. **Prioridade entre P0**: se tiver que escolher só um bloco para atacar primeiro — Pagamento (Stripe webhook)? Legal (Termos + cookies)? Observabilidade? Mobile?
4. **Budget de terceiros**: pode contratar Sentry ($26/mês), PostHog (free até 1M events), Crisp (free tier)? Ou quer usar só o que é gratuito?

Assim que responder, eu monto o plano detalhado da próxima onda em código.
