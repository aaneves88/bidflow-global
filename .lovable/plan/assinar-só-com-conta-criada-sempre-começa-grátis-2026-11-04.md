# Assinar só com conta criada (sempre começa grátis)

## O que muda para a pessoa
1. **Página de planos sem login:** todos os botões viram "Criar conta grátis" e levam ao cadastro normal. Aparece uma frase curta: "Toda conta começa grátis. Você pode assinar o Premium depois, dentro do Orca."
2. **Cadastro:** sempre cria a conta no plano Grátis e segue o cadastro inicial de hoje (nome do negócio → primeira proposta). Nada de pagamento aqui.
3. **Página de planos com login:** o botão "Assinar" do Premium abre o pagamento, como já funciona hoje. O plano Grátis mostra "Plano atual".
4. Nenhum pagamento consegue ser aberto sem uma conta logada.

## Fica igual
Preço, limite de 3 propostas, tela de pagamento, cadastro inicial e e-mails.

## Detalhes técnicos
- `Pricing.tsx`: quando `!user`, botões apontam para `/register` (sem `?plan=`); `handleSubscribe` mantém a trava e redireciona para `/login?redirect=/pricing` se chamado sem sessão.
- Adicionar texto informativo no topo dos cards (i18n `pricing` pt-BR/en).
- Remover qualquer leitura de `?plan=` no cadastro, se existir; links antigos com `?plan=` continuam abrindo o cadastro normal.
- Checar: deslogado → planos → botão leva ao cadastro; logado → Assinar abre o Stripe.
