# Premium Anual: 12 meses garantidos ao assinar

## Como funciona hoje
- Ao pagar, o Premium ativa sem data de fim e fica ativo enquanto a assinatura existir. O Stripe cobra de novo em 12 meses.
- O problema: o sistema não guarda até quando o ano já foi pago. Se algo der errado com a renovação, não fica claro que a pessoa tem direito ao ano inteiro.

## O que muda
1. Ao assinar o **Premium Anual**, o Orca grava "válido até" = data do pagamento + 12 meses (usando a data exata que o Stripe informa).
2. Na renovação de cada ano, essa data avança mais 12 meses.
3. Se a pessoa cancelar, continua Premium até o fim dos 12 meses pagos e depois volta para o Grátis.
4. Se o pagamento da renovação falhar, os 12 meses já pagos não são cortados antes do fim.
5. Minha conta mostra "Premium Anual — válido até DD/MM/AAAA".
6. O mensal continua como está hoje.

## Verificação
- Teste automático: plano anual pago hoje = válido até a mesma data do ano seguinte.
- Simular um pagamento anual no webhook com uma conta de teste e conferir a data em Minha conta.

## Detalhes técnicos
- `stripe-webhook`: em `checkout.session.completed`, `invoice.paid` e `customer.subscription.updated`, quando o plano tem `interval='year'`, gravar `expires_at = subscription.current_period_end` (fallback: +12 meses) em vez de `null`.
- Garantir que a checagem de plano ativo trata `expires_at` futuro como ativo (conferir `useSubscription`/limites).
- Helper puro `annualExpiry(start)` com teste vitest.
- `AccountPage`: exibir `expires_at` para planos anuais.
