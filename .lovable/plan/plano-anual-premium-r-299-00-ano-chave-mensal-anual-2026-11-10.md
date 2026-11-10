# Plano anual Premium (R$ 299,00/ano) + chave Mensal/Anual

## O que você vai ver
- Na tela de Planos, uma chave **Mensal | Anual** acima dos cartões.
- Mensal: Premium R$ 29,00/mês (como hoje).
- Anual: Premium **R$ 299,00/ano**, com selo "Economize 14%" e a linha "equivale a R$ 24,92/mês".
- O botão "Assinar" abre o pagamento do preço escolhido. Deslogado continua "Criar conta grátis".
- Minha conta e o admin mostram "Premium Anual" quando for o caso.

## O que muda
1. Criar o plano **Premium Anual** no banco (R$ 299,00, intervalo anual, mesmos limites ilimitados do Premium mensal).
2. Ligar esse plano ao preço `price_1UaGfwCcN2Sjz1n5eEdc83MD` na configuração de pagamento.
3. Tela de Planos: chave Mensal/Anual; o cartão Grátis aparece nos dois; o pago troca conforme a chave.
4. Confirmar que a ativação após o pagamento reconhece o plano anual (já usa o plano enviado no pagamento) e que a renovação/cancelamento funcionam igual.
5. Textos pt-BR/en e teste do cálculo de economia (29×12 = 348 vs 299 → 14%).

## Verificação
- Abrir o pagamento anual logado e confirmar R$ 299,00/ano na tela do Stripe (sem pagar).

## Detalhes técnicos
- Inserir linha em `plans` (interval `year`, `is_starter=false`, mesmos `max_*` do Premium).
- Adicionar `{ <id do plano anual>: price_1UaGf... }` em `app_settings.stripe_product_mapping` (lido por `stripe-create-checkout`).
- `Pricing.tsx`: estado `billing: 'month'|'year'`, filtra planos pagos por `interval`; esconde a chave se não houver plano anual ativo.
- Revisar `stripe-webhook` para mapear `plan_id` da metadata (sem depender de intervalo mensal).
