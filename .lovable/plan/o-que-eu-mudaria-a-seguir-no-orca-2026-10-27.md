# O que eu mudaria a seguir no Orca

Os números mostram duas quedas: a pessoa cria a conta e não faz proposta (70%), e quem faz quase nunca envia ao cliente. O cartão do modelo por ramo já ataca a primeira queda. Proponho mais três mudanças, nesta ordem:

## 1. Empurrar o envio logo depois de salvar
- Na tela da proposta recém-criada, destacar um botão grande "Enviar no WhatsApp", com o texto da mensagem já pronto.
- Se a proposta não tiver cliente, pedir só nome e telefone ali mesmo, sem sair da tela.
- Motivo: só 1 proposta foi aberta por um cliente. Sem cliente abrindo, a pessoa não vê o valor do Orca.

## 2. Lembrete quando a proposta não foi aberta
- 24h depois de criada, se ninguém abriu, mandar um aviso no sininho e um e-mail: "Sua proposta ainda não foi vista — reenvie no WhatsApp", com o botão.
- Uma vez por proposta, e nunca para quem pediu para não receber e-mails.

## 3. Resgate de quem tentou pagar e desistiu
- Um e-mail único, 1 dia depois, para quem abriu o pagamento e não concluiu: lembrando o que o Premium libera, com o link para concluir.
- Em paralelo, trocar o nome "StateMatch" por "Orca" na tela de pagamento. Isso é feito nas configurações do Stripe, por você.

## Fica de fora (só se você pedir)
- Mudar preço, dias grátis ou limite de propostas.

## Detalhes técnicos
- Item 1: `ProposalView` ganha um bloco de envio em destaque quando a proposta é nova; reaproveita `whatsapp.ts` e `ClientDialog`.
- Item 2: nova rotina diária no mesmo padrão das rotinas de e-mail existentes (token em `internal_secrets`), com controle de envio para não repetir e respeitando `suppressed_emails`.
- Item 3: rotina diária lendo os eventos `checkout_started` sem plano pago depois, com registro de envio próprio.
- Textos em pt-BR e en.
