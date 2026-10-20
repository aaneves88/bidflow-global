## Link de pagamento do próprio negócio na proposta

Hoje o usuário já pode cadastrar a chave PIX dele e ela aparece na proposta. A ideia aqui é seguir o mesmo modelo para um **link de pagamento com cartão** (Mercado Pago, PagSeguro, InfinitePay, Stripe, PayPal ou outro). O Orca só mostra o link. O pagamento acontece direto no serviço do usuário, e o Orca não cobra nem intermedeia nada.

### Como fica para o usuário
1. **Minha conta:** novo quadro "Link de pagamento (cartão)", logo abaixo da Chave PIX. A pessoa cola o link e, se quiser, escreve um texto curto (ex.: "Pague em até 12x no cartão"). Esse link vira o padrão de todas as propostas.
2. **Na proposta:** campo opcional para usar um link diferente só naquela proposta. Por exemplo, um link do Mercado Pago com o valor exato daquele serviço.
3. **Para o cliente (link público):** novo quadro "Pagar com cartão" ao lado do PIX, com o botão "Pagar com cartão" e o aviso "O pagamento é feito diretamente ao recebedor".
4. **PDF:** mostra o link de pagamento junto do PIX.

### Regras
- Só aceita links que começam com `https://`.
- Fica disponível em todos os planos, como o PIX.
- Se a pessoa não cadastrar nenhum link, nada muda na proposta.

### Detalhes técnicos
- Migração: `payment_link text` e `payment_link_label text` em `profiles` e em `proposals`, com CHECK `^https://`.
- A função pública que hoje devolve o PIX passa a devolver também o link: usa o link da proposta e, se não houver, o do perfil (mesmo COALESCE do PIX).
- Novo componente `PaymentLinkCard` (conta) seguindo o mesmo modelo do `PixKeyCard`. Campo novo no `ProposalForm` e no `useProposals` (criar, editar, duplicar).
- `PublicProposal`: card com botão `target=_blank rel="noopener noreferrer"`. No PDF, o link aparece como texto clicável.
- Textos em pt-BR e en.
- Testar de ponta a ponta: cadastrar o link na conta, trocar o link numa proposta, abrir o link público sem estar logado e baixar o PDF.
