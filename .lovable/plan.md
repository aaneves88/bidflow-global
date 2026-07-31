# Stripe pronto para produção + lançamento PWA

## Situação atual (verificada)

- `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` já estão salvos nos secrets do backend.
- A função `stripe-webhook` existe e trata `checkout.session.completed`, `customer.subscription.deleted` e `invoice.payment_failed`.
- **Ela nunca recebeu nenhuma chamada** — não há registro de log algum, ou seja, o webhook ainda não foi testado de ponta a ponta.
- A tabela `user_plans` já tem `stripe_customer_id`, `stripe_subscription_id`, `stripe_email`, e hoje está **sem nenhuma assinatura registrada**.
- Planos no banco: Gratuito (R$ 0) e Premium (R$ 29/mês). Nenhum registro em `app_settings` de integrações, então o fluxo em uso é o **Payment Link** (`VITE_STRIPE_PAYMENT_LINK`) com `client_reference_id` + `prefilled_email`.
- PWA: `manifest.webmanifest`, `sw.js`, ícones 192/512 e apple-touch-icon já existem e o registro do SW está protegido contra o preview.

## O que falta para o Stripe ficar "certinho"

1. **Cobertura de eventos incompleta.** Hoje falta tratar renovação e mudanças de estado da assinatura. Adicionar ao `stripe-webhook`:
   - `customer.subscription.updated` — refletir `past_due`, `canceled`, `active` e `cancel_at_period_end`.
   - `invoice.paid` — atualizar `expires_at` a cada renovação (hoje a renovação não atualiza nada).
   - Idempotência: ignorar eventos já processados (guardar `event.id`).
2. **Reativação após inadimplência.** Se o pagamento falhar e depois for pago, o plano precisa voltar a `active` — hoje fica preso em `past_due`.
3. **Portal do cliente (cancelamento/troca de cartão).** Nova função `stripe-portal` que cria uma sessão do Billing Portal para o usuário logado, usando o `stripe_customer_id` salvo. Botão "Gerenciar assinatura" na página `/account` e em `/pricing` para quem já é Premium. Isso também é exigência prática para lojas e para o Código de Defesa do Consumidor (cancelamento fácil).
4. **Retorno pós-pagamento.** Configurar a página de confirmação do Payment Link para voltar a `/dashboard?checkout=success` e exibir um toast "Premium ativado" com refetch do plano (hoje o usuário paga e volta sem feedback).
5. **Estado do plano na UI.** Mostrar em `/account` o plano atual, status (`active`, `past_due`, `cancelled`) e data de renovação/expiração.
6. **Teste ponta a ponta.** Rodar um pagamento em modo teste e conferir os logs da função + a linha criada em `user_plans`.

## Passos manuais seus (Stripe Dashboard)

- Webhook apontando para `https://mhsyllzvzuorzyacobar.supabase.co/functions/v1/stripe-webhook` com os eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
- Confirmar que o `STRIPE_WEBHOOK_SECRET` salvo é o desse endpoint (modo live e teste têm secrets diferentes).
- No Payment Link: ativar "Confirmation page → Redirect" para `https://orca-mento.app/dashboard?checkout=success`.
- Ativar o Customer Portal em Settings → Billing → Customer portal (permitir cancelar e atualizar cartão).

## Para lançar como PWA

- Página `/dashboard` e afins funcionam offline básico; nada a mudar no service worker.
- Adicionar um convite discreto de "Instalar app" (banner/botão) usando o evento `beforeinstallprompt` no Android/Chrome, com instruções para iOS (Compartilhar → Adicionar à Tela de Início).
- Revisar `manifest.webmanifest`: incluir `screenshots` e `categories` (melhora o prompt de instalação e futura publicação via PWABuilder).

## Detalhes técnicos

- Arquivos tocados: `supabase/functions/stripe-webhook/index.ts` (eventos + idempotência), nova `supabase/functions/stripe-portal/index.ts` (JWT validado em código), `src/pages/account/AccountPage.tsx` (card de assinatura), `src/pages/Pricing.tsx` (botão gerenciar), `src/pages/Dashboard.tsx` (toast de sucesso), i18n pt-BR/en, `public/manifest.webmanifest`, novo componente de instalação PWA.
- Migração: tabela `stripe_events (id text primary key, received_at timestamptz)` com GRANT apenas para `service_role`, usada para idempotência.
- Sem mudança no modelo de planos nem no fluxo de Payment Link atual.
