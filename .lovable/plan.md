# Deixar o pagamento funcionando de verdade (antes de mexer no preço)

## Situação hoje
- No sistema existem 2 planos: Gratuito (R$0) e Premium (R$29,00/mês). Não existe plano anual.
- A chave "Stripe ligado" está salva no lugar errado: a função que abre o pagamento procura em outro lugar, então hoje responde "Stripe não está ativado".
- Nenhum plano está ligado a um preço do Stripe. Mesmo com o Stripe ligado, o botão "Assinar" daria erro.
- Conclusão: o pagamento **não** está pronto. Não é só trocar o preço.

## O que vou fazer
1. Confirmar que a chave secreta do Stripe está guardada e se é de teste ou de produção.
2. Corrigir onde o sistema lê "Stripe ligado" (aceitar os dois lugares, sem quebrar o painel do admin).
3. Criar no Stripe o preço do Premium mensal no valor atual (R$29,00) e ligar ao plano Premium.
4. Testar com cartão de teste: Assinar → pagar → conta vira Premium → "Gerenciar assinatura" abre.
5. Só depois, quando você decidir: trocar para R$29,90 e criar o anual R$239,90 (é rápido, porque a estrutura já estará pronta).

## Detalhes técnicos
- `stripe-create-checkout` filtra `category='integrations'`; o registro está em `category='stripe'`. Ajustar leitura por `key` (sem filtro de categoria) ou migrar o registro.
- `stripe_product_mapping` inexistente: gravar `{ <plan_id Premium>: <price_id> }`.
- Verificar `stripe-webhook` (segredo do webhook e endpoint cadastrado) no teste ponta a ponta.
