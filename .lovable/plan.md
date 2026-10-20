# Orca — ações para trazer usuários pagantes (decidido item a item)

Diagnóstico: o tráfego vem quase todo de anúncios Meta (49 de 77 visitas, pesquisa de 14/10). A maioria dos cadastros nunca cria proposta. O gargalo é fazer quem chega usar e ter motivo claro para pagar.

## O que vou mudar no app (nesta ordem)

1. **Site sempre em português**: todas as páginas públicas em pt-BR, sem botão de idioma.
2. **Novo modelo de preço**:
   - Contas novas: 7 dias de Premium completo, sem cartão. Depois, "somente leitura": vê e compartilha propostas antigas (links já enviados continuam funcionando), mas não cria nem edita sem assinar. Sem plano grátis para novos.
   - Contas existentes: continuam no modelo antigo (3 propostas / 5 clientes grátis).
   - Premium R$29,90/mês e anual R$239,90 ("2 meses grátis"), iguais no site, na página de preços e no Stripe.
3. **Proposta de exemplo pronta**: ao terminar o onboarding, criamos uma proposta já preenchida do ofício da pessoa; ela só edita e envia.
4. **Aviso "seu cliente abriu"**: sininho + e-mail na hora, com botão pronto de WhatsApp para falar com o cliente.
5. **Contagem do teste + lembretes**: faixa "faltam X dias" no app e e-mails no dia 5 e no dia 7, mostrando quanto ela já enviou em propostas. Depois do teste, ao tentar criar, aparece a tela de assinar (mensal ou anual).

Fica como está: programa de indicação (recompensa manual pelo admin) e página "Seja parceiro" (para depois).

## Fora do app (fica para depois)

Ações de divulgação que vocês fazem fora do Orca — mensagens pessoais para quem se cadastrou, textos de anúncio, contato com contadores, cadastro em sites de divulgação. Retomamos isso depois que as mudanças acima estiverem no ar.

## O que você precisa fazer

- No Stripe: criar os preços R$29,90/mês e R$239,90/ano (eu te passo o passo a passo) e me enviar os novos links de pagamento.

## Como medir

- % de contas novas que enviam a 1ª proposta nos 7 dias.
- % que assina depois do teste (relatório semanal do admin).

## Detalhes técnicos

- 1: forçar `lng: 'pt-BR'` em `src/i18n/index.ts` para rotas públicas; títulos via `Seo.tsx`.
- 2: novo plano "Teste 7 dias" em `plans` (trial_days=7) concedido no cadastro via `handle_new_user`/`signup-guarded` só para contas criadas após a data de corte; estado "somente leitura" em `planLimits.ts`/`useSubscription` quando trial expira sem assinatura; contas antigas mantêm plano Gratuito. Atualizar Premium para 29,90, criar Anual 239,90 (interval year) e preços lidos da tabela em Landing/Pricing; webhook do Stripe reconhecendo os dois preços.
- 3: proposta-modelo a partir de `src/content/niches` criada no fim do onboarding.
- 4: estender `notify-proposal-event` com e-mail de app (template novo) + link wa.me; `NotificationsBell` com botão de WhatsApp.
- 5: banner no `AppLayout` com dias restantes; nova rotina diária de e-mail (padrão `internal_secrets`) para dias 5 e 7, com log anti-duplicidade; `UpgradeModal` com opção mensal/anual.
- Testes: regra de 7 dias, somente leitura após expirar, contas antigas preservadas, preços 29,90/239,90.
