# Orca — ações para trazer usuários pagantes

Diagnóstico: o tráfego vem quase todo de anúncios Meta (49 de 77 visitas, pesquisa de 14/10). A maioria dos cadastros nunca cria proposta. O gargalo é ativação, não falta de visitas. Por isso o foco é: 1) fazer quem chega usar, 2) dar um motivo claro para pagar, 3) só depois aumentar a aquisição.

## Parte A — Mudanças no app (em ordem)

1. **Site sempre em português** (decidido): todas as páginas públicas em pt-BR, sem exceção e sem botão de idioma.
2. **Novo modelo de preço** (decidido):
   - Novas contas: 7 dias de Premium completo, sem cartão. Depois, conta em "somente leitura": vê e compartilha propostas antigas (links enviados continuam funcionando), mas não cria/edita sem assinar. Não há mais plano grátis para novos.
   - Contas existentes: continuam no modelo antigo (Gratuito 3 propostas / 5 clientes).
   - Premium R$29,90/mês e anual R$239,90 ("2 meses grátis"), iguais em landing, /pricing, banco e Stripe (exige criar os dois preços no Stripe).
   - O item A6 (teste de 7 dias) fica absorvido aqui.
3. **Proposta de exemplo pronta no 1º acesso** (decidido): ao terminar o onboarding, criamos uma proposta já preenchida do ofício dela; só edita e envia.
4. **Momento "uau" visível**: quando o cliente abre a proposta, notificação + e-mail "Seu cliente abriu agora — mande um WhatsApp". É a dor nº 1 do público.
5. **Paywall no momento certo**: no grátis, liberar criar; mostrar o upgrade quando a pessoa tenta a 2ª proposta ou quer tirar a marca d'água, com mensagem "Você já fechou R$ X com a Orca".
6. **Teste do Premium por 7 dias sem cartão** para quem enviou a 1ª proposta (recompensa a ativação, não o cadastro).
7. **Indicação com recompensa real**: hoje a página /convidar promete "créditos" sem regra. Definir: quem indica ganha 1 mês grátis quando o indicado assina; indicado ganha 10%.
8. **Página "Seja parceiro"** (contadores, escolas de cursos, influenciadores de MEI) com cadastro e cupom de 10% — o vídeo de parceiro já existe e aponta para algo que ainda não existe.

## Parte B — Estratégia (fora do app)

1. **Primeiros 20 pagantes "na mão"**: o Antonio e a Schanna falam pessoalmente (WhatsApp) com cada pessoa que se cadastrou e não criou proposta. Oferecer ajuda para montar a primeira. Aprender o motivo de desistência.
2. **Anúncios com a mensagem certa**: "Saiba quando o cliente abriu + PIX + aceite em 1 clique", segmentando ofícios (eletricista, fotógrafo, ar-condicionado, decoração). Usar os vídeos educativos como conteúdo de topo, não de venda direta.
3. **Parcerias com contadores de MEI**: cada contador indica clientes com cupom de 10%. Canal barato e com confiança.
4. **Conteúdo orgânico** com a biblioteca de vídeos (Instagram/Reels, grupos de MEI no Facebook, r/MicroSaaSBR).
5. **Diretórios**: MicroSaaS MKT, SaaSCity, FindSaaS.
6. **Diferenciar da "Orca App"** (concorrente com mesmo nome): sempre usar "Orca — orca-mento.app" nos anúncios e conteúdo.

## Como medir

- Ativação: % que envia a 1ª proposta em 7 dias (meta inicial: 30%).
- Conversão grátis → pago (por canal, já existe no admin).
- Revisar semanalmente no relatório semanal do admin.

## Sugestão de primeira entrega

Itens A1, A2 e A3 juntos (português + preço consistente + proposta de exemplo), seguidos de A4 e A5. Ao aprovar, implemento nessa ordem e paro antes da Parte B para alinhar mensagens.

## Detalhes técnicos

- A1: fixar `lng: 'pt-BR'` nas rotas públicas em `src/i18n/index.ts`; títulos/descrições por página via `Seo.tsx`.
- A2: fonte única de preço vinda da tabela `plans`; ativar plano anual.
- A3: criar proposta-modelo por nicho (`src/content/niches`) no fim do onboarding.
- A4: reaproveitar `notify-proposal-event` e `NotificationsBell`.
- A5/A6: ajustar `planLimits.ts`, `UpgradeModal` e concessão de trial em `user_plans`.
- A7: regra de recompensa no `stripe-webhook` marcando indicação como paga e estendendo 30 dias (lógica já existe em `useGrantReferralReward`).
- A8: nova rota pública `/parceiros` com formulário salvo no banco.
