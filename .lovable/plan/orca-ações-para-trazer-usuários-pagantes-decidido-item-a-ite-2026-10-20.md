# Orca — ações para trazer usuários pagantes (decidido item a item)

Diagnóstico: o tráfego vem quase todo de anúncios Meta (49 de 77 visitas, pesquisa de 14/10). A maioria dos cadastros nunca cria proposta. O foco agora é fazer quem chega usar o Orca.

## O que vou mudar no app agora

1. **Site sempre em português**: todas as páginas públicas em pt-BR, sem botão de idioma.
2. **Proposta de exemplo pronta**: ao terminar o onboarding, criamos uma proposta já preenchida do ofício da pessoa; ela só edita e envia.
3. **Aviso "seu cliente abriu"**: sininho + e-mail na hora, com botão pronto de WhatsApp para falar com o cliente.

Plano grátis continua com 3 propostas / 5 clientes e Premium a R$29,00/mês, sem mudança.

## Engatilhado para um segundo momento

- **Novo modelo de preço**: 7 dias de Premium sem cartão para contas novas, depois "somente leitura"; contas existentes no modelo antigo; Premium R$29,90/mês e anual R$239,90 (exige criar os preços no Stripe).
- **Contagem do teste + lembretes**: faixa "faltam X dias" e e-mails nos dias 5 e 7.
- Programa de indicação com recompensa automática e página "Seja parceiro".
- Ações fora do app (mensagens pessoais, anúncios, contadores, sites de divulgação).

Esses itens ficam anotados na lista de tarefas do projeto para retomarmos.

## Como medir

- % de contas novas que enviam a 1ª proposta nos primeiros 7 dias (relatório do admin).

## Detalhes técnicos

- 1: forçar `lng: 'pt-BR'` em `src/i18n/index.ts` para rotas públicas; títulos via `Seo.tsx`.
- 2: proposta-modelo a partir de `src/content/niches` criada ao concluir o onboarding (uma vez por conta, só se não houver propostas).
- 3: estender `notify-proposal-event` com e-mail de app (template novo, uma vez por proposta na 1ª abertura) + link wa.me para o telefone do cliente; `NotificationsBell` com botão de WhatsApp.
- Registrar os itens adiados em `roadmap.md`.
