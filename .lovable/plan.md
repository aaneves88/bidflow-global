# Página de Integrações no Admin

## 1. Nova aba "Integrações" em `/admin?tab=integrations`

Atualizar `src/pages/admin/Admin.tsx` adicionando a tab `integrations` ao lado de overview/users/plans/statuses.

Criar `src/pages/admin/AdminIntegrations.tsx` com layout em cards, um por integração, mostrando status (Ativo / Inativo / Em breve).

## 2. Card Stripe — gerenciamento + passo a passo

Componente `src/pages/admin/integrations/StripeIntegrationCard.tsx`:

- **Status** lido de `app_settings` categoria `stripe`:
  - `stripe.enabled` (bool)
  - `stripe.mode` (`test` | `live`)
  - `stripe.publishable_key` (string, pode ficar no banco — é pública)
  - `stripe.success_url`, `stripe.cancel_url`
  - `stripe.product_mapping` (jsonb: `{ plan_id: stripe_price_id }`)
- Switch para ativar/desativar
- Form para preencher publishable key, URLs e modo
- Tabela mapeando cada plano (lê `usePlans`) para um `price_id` do Stripe
- Botão **"Testar checkout"** (só habilita quando configurado)
- Aviso destacado: a **secret key** vai em Lovable Cloud → Secrets (não no banco). Botão abre painel de secrets via `add_secret` (`STRIPE_SECRET_KEY`).

**Passo a passo guiado** (Accordion dentro do card, em pt-BR):
1. Criar conta no Stripe (link stripe.com/register)
2. Pegar as chaves em Developers → API keys (test/live)
3. Colar a publishable key no form
4. Adicionar a secret key como secret `STRIPE_SECRET_KEY`
5. Criar produtos/preços no Stripe e colar cada `price_id` no mapeamento de planos
6. Configurar webhook apontando para a edge function `stripe-webhook` (URL exibida no card) e colar o `STRIPE_WEBHOOK_SECRET` em secrets
7. Testar em modo `test`, depois virar para `live`

## 3. Edge functions Stripe (estrutura mínima)

- `supabase/functions/stripe-create-checkout/index.ts` — recebe `plan_id`, lê mapeamento de `app_settings`, cria sessão de checkout com `STRIPE_SECRET_KEY`, retorna URL. JWT validado em código.
- `supabase/functions/stripe-webhook/index.ts` — público (sem JWT), valida assinatura com `STRIPE_WEBHOOK_SECRET`, em `checkout.session.completed` faz upsert em `user_plans` (status `active`, expires conforme intervalo do plano).
- Wire do botão "Assinar" em `src/pages/Pricing.tsx`: quando `stripe.enabled = true`, chama `stripe-create-checkout` e redireciona; senão mantém "Em breve".

`supabase/config.toml`: adicionar `verify_jwt = false` para `stripe-webhook`.

## 4. Outras integrações (cards "Em breve")

Mostrar como placeholders no mesmo grid, sem lógica ainda, só descrição do valor:

- **WhatsApp Business** — enviar proposta e notificar mudanças de status pelo WhatsApp do cliente (alto valor no Brasil)
- **E-mail transacional (Resend)** — enviar proposta por e-mail com template, lembrete de validade, notificação de aceite
- **Pix / Mercado Pago** — alternativa local ao Stripe para receber pagamento da assinatura ou da própria proposta
- **Google Calendar** — agendar reunião automática quando proposta é aceita
- **Notion / Google Sheets** — exportar pipeline de propostas
- **Zapier / Make** — webhook genérico de saída para integrar com qualquer ferramenta

Cada card tem botão "Sugerir" (só registra interesse via toast por enquanto) e badge "Em breve".

## 5. i18n

Novo namespace `integrations` em `src/i18n/locales/pt-BR/integrations.json` e `en/integrations.json` com todos os textos do card Stripe, passo a passo e dos cards futuros.

Adicionar entrada `tabs.integrations` em `admin.json`.

## 6. Roadmap

Atualizar `docs/product-roadmap.md` adicionando a seção **Integrações** marcando Stripe como em progresso e listando as outras como planejadas.

## Detalhes técnicos

- Usar tool `payments--enable_stripe_payments` **não** será usado — o usuário pediu explicitamente gerenciar a integração do Stripe pelo admin (BYOK). Será chamado `stripe--enable_stripe` apenas se necessário; caso contrário, secret manual via `add_secret`.
- Hook novo `useIntegrationSettings('stripe')` reaproveitando `useAppSettings`.
- Acesso à página: `requireAdmin` já aplicado em `/admin`.
- Não muda schema do banco — só adiciona linhas em `app_settings`.

## Fora do escopo agora

- Customer Portal Stripe
- Faturas/recibos no app do usuário
- Ativação real das integrações "Em breve"
