# Campo de cupom no checkout

## O que está acontecendo

A tela da captura é o **Stripe Checkout** gerado pelo Payment Link (`VITE_STRIPE_PAYMENT_LINK`). O campo "Adicionar código promocional" não aparece porque é uma opção do próprio Payment Link no Stripe — não existe nada no código da Orca que possa habilitá-lo.

Dois pontos secundários visíveis na mesma tela:
- O nome da conta aparece como **StateMatch** (branding da conta Stripe), não Orca.
- O produto está como "OrcaPremium" (sem espaço).

## Ajuste no Stripe (feito por você, sem código)

1. Payment Link usado pela Orca → editar → marcar **"Permitir códigos promocionais"** (Allow promotion codes). O Stripe passa a exibir o link "Adicionar código promocional" no checkout.
   - Se o link já teve pagamentos, o Stripe pode exigir criar um novo link; nesse caso basta trocar o valor de `VITE_STRIPE_PAYMENT_LINK`.
2. Conferir em Configurações → Branding se o nome/logo devem virar Orca.
3. Renomear o produto para "Orca Premium" se quiser.

Os cupons dos parceiros de indicação (`referral_partners.coupon_code`) precisam existir como **Promotion codes** no Stripe com o mesmo texto, senão o cliente digita e recebe erro. O webhook já lê o cupom aplicado e liga ao parceiro.

## Opcional, do lado do app

Depois que a opção estiver ativa no Stripe, dá para pré-preencher o cupom automaticamente:

- `src/lib/stripeCheckout.ts`: aceitar um `promoCode` opcional e adicionar `prefilled_promo_code` na URL do Payment Link.
- `UpgradeModal.tsx` / `Pricing.tsx`: passar o cupom quando o usuário chegou por um link de parceiro (`?coupon=` / indicação já guardada no localStorage), para o desconto já vir aplicado.

Me diga se quer que eu implemente essa parte opcional — a habilitação do campo em si é só no painel do Stripe.
