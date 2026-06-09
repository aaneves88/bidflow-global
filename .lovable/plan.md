
# Roadmap até o lançamento comercial da Orca

## Visão geral

Vamos organizar tudo em **ondas numeradas** com versão semântica (v0.x → v1.0 no lançamento). Cada onda gera um **release documentado** em `docs/releases/` com changelog, screenshots e notas para stores/marketing.

---

## Sistema de Releases (cria primeiro, usa em todas as ondas)

**Estrutura nova:**
```
docs/
├── ROADMAP.md                    ← Visão geral viva, status de cada onda
├── releases/
│   ├── README.md                 ← Índice de releases
│   ├── v0.3.0-pdf-hibrido.md
│   ├── v0.4.0-seguranca.md
│   └── (próximas)
└── marketing/
    ├── app-description-pt.md     ← Texto curto + longo para stores/landing
    ├── app-description-en.md
    ├── features-list.md          ← Lista de features para landing/comparativo
    └── screenshots/              ← Capturas oficiais para divulgação
```

**Cada release** segue template fixo:
- Versão, data, codinome
- Resumo (1 parágrafo)
- Novidades para usuário final (linguagem de marketing)
- Mudanças técnicas (changelog)
- Breaking changes / migrações
- Métricas/limites afetados

Também: bump de `version` no `package.json` a cada release.

---

## Onda 3 — E-mails transacionais  `v0.5.0`

- Configurar domínio `notify.orca-mento.app` (Lovable Emails nativo)
- Setup de infra de e-mail (filas, cron, logs)
- Templates auth (signup, recuperação, magic link, etc.) com branding Orca
- Templates transacionais:
  - Proposta enviada (cliente recebe link)
  - Proposta visualizada (você recebe notificação)
  - Proposta aceita / assinada
  - Boas-vindas pós-signup
  - Aviso de limite do plano Free
- Editor de templates no Admin (assunto + corpo HTML, com preview)
- Página de unsubscribe branded

## Onda 4 — Painel Administrativo de verdade  `v0.6.0`

- Layout dedicado `/admin` com sidebar própria (só admins)
- **Dashboard**: MRR estimado, usuários ativos, propostas/mês, conversão Free→Pago, churn
- **Usuários**: lista, busca, ver perfil, alterar plano manualmente, suspender, virar admin
- **Planos**: editar limites/preços (já existe parcial — refinar UI)
- **Templates de e-mail**: editor (Onda 3)
- **Settings globais**: branding default, moeda, integrações
- **Logs**: e-mails enviados, webhooks, erros
- **Feature flags**: ligar/desligar funcionalidades sem deploy

## Onda 5 — Pagamentos (Stripe)  `v0.7.0`

- Integração Stripe (Lovable Payments nativo)
- Produtos Pro e Business no Stripe (mensal + anual)
- Checkout hospedado para upgrade
- Webhook para sincronizar `user_plans` (assinatura ativa, cancelada, inadimplente)
- Portal do cliente (cancelar, trocar plano, atualizar cartão)
- Banner de "trial acabando" / "pagamento falhou"
- Cupons / códigos promocionais (admin)
- Suporte a PIX (via Stripe Brasil) se disponível

## Onda 6 — LGPD + Conformidade legal  `v0.8.0`

- Páginas públicas: `/termos`, `/privacidade`, `/cookies`
- Geração das minutas (PT-BR) — focadas em CRM/SaaS B2B
- Checkbox de aceite obrigatório no signup, com registro em `user_consents` (timestamp + IP + versão)
- Banner de cookies (apenas analíticos opcionais)
- Página `/conta/dados` — exportar todos os dados (LGPD art. 18) e deletar conta
- Edge function `delete-user-account` (cascade + anonimização)

## Onda 7 — Landing institucional `orca-mento.app`  `v0.9.0`

- Site público em `/` (separado da app que fica em `/app/*` ou subdomínio)
- Seções: hero, problema/solução, features, pricing, depoimentos (placeholders), FAQ, CTA
- Comparativo Free vs Pro vs Business
- Blog estático (markdown) — opcional, ou só estrutura
- SEO completo: meta tags por rota (react-helmet-async), sitemap.xml dinâmico, robots.txt, JSON-LD Organization + Product
- OG images geradas (1 por seção principal)
- Performance: lazy load, imagens otimizadas
- Multi-idioma (PT-BR + EN) usando i18next já configurado

## Onda 8 — Onboarding + Polish pré-lançamento  `v0.10.0`

- Empty states bonitos em todas as listas (clientes, propostas)
- Checklist de primeiros passos no dashboard (criar 1º cliente → 1ª proposta → enviar)
- Tooltips e dicas contextuais
- Confirmação obrigatória de e-mail no signup (desligar auto-confirm)
- Testes em mobile real (iOS Safari + Android Chrome)
- Revisão de copy (todos os textos PT-BR)
- Acessibilidade básica (contraste, navegação por teclado, alt texts)

## Onda 9 — Observabilidade + Lançamento  `v1.0.0`

- Sentry (frontend + edge functions) — erros + performance
- Analytics: PostHog ou Plausible (privacy-friendly, LGPD compliant)
- Eventos chave trackados: signup, criar proposta, enviar, aceitar, upgrade
- Status page simples (`status.orca-mento.app`)
- Canal de suporte: e-mail `suporte@orca-mento.app` + widget de feedback no app
- Material de marketing finalizado (descrições, screenshots, vídeo demo de 60s)
- **Release v1.0.0** + anúncio

---

## Resposta direta

**Onda 3, 4, 5 + as ondas 6, 7, 8, 9** — esse é o caminho completo até lançamento comercial seguro e profissional. Sem 6-9 dá pra lançar tecnicamente, mas seria amador e arriscado juridicamente.

**Estimativa de execução**: cada onda é entregável em 1-3 interações nossas. Total: ~15-20 ciclos de trabalho.

---

## Ordem de execução proposta

1. **Setup de releases** (docs/ROADMAP.md + template + retroativar v0.1-v0.4 das ondas já feitas)
2. Onda 3 (e-mails) — desbloqueia recuperação de senha e notificações
3. Onda 4 (admin) — você precisa pra operar
4. Onda 5 (pagamentos) — desbloqueia monetização
5. Onda 6 (LGPD) — obrigatório antes de aceitar pagamento de público
6. Onda 7 (landing) — pode ser feita em paralelo se quiser
7. Onda 8 (polish)
8. Onda 9 (observabilidade + lançamento)

---

## Notas técnicas

- **Releases retroativas**: vou criar v0.1.0 (CRM base), v0.2.0 (i18n + branding), v0.3.0 (planos + watermark), v0.4.0 (PDF híbrido + segurança) baseando-se no histórico do projeto.
- **Memória**: adicionar `mem://features/releases-process` para que toda futura mudança gere/atualize release.
- **package.json**: bump de versão a cada onda concluída.
- **Branding**: tudo PT-BR primeiro, EN como fallback (regra existente).

---

## Próximo passo se aprovar

Começo pelo **Sistema de Releases + retroativar v0.1-v0.4**, depois entro direto na **Onda 3 (e-mails)** na mesma resposta.
