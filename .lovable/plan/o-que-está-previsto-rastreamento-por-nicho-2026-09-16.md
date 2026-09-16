# O que está previsto + rastreamento por nicho

## O que ainda está previsto (roadmap atual)

Em andamento:
- v0.6.1 — fechamento técnico da Play Store (ícones, splash, assetlinks)
- v0.8.1 — automação de conversão no Stripe + créditos de indicação

Planejado:
- v0.9.0 — SEO, landing institucional e páginas de nicho (é aqui que este pedido entra)
- v0.10.0 — LGPD, termos, consentimento e ajustes pré-lançamento
- v1.0.0 — observabilidade e lançamento comercial

## O pedido: saber qual nicho gera mais conversão

Hoje as páginas de nicho e o hub de modelos não registram nada. O que existe:
- a origem da primeira visita (UTM, referrer, página de entrada) fica salva no navegador por 30 dias e é gravada no perfil no cadastro;
- os eventos de produto só podem ser gravados por quem está logado, então cliques de visitante anônimo não têm como ser registrados hoje.

Ou seja: para medir o caminho "página de nicho → cadastro → proposta enviada", falta registrar os cliques anônimos e carregar a marca do nicho até o cadastro.

## O que será feito

1. Marcar a origem do nicho no navegador
   - Ao abrir `/modelo-de-orcamento/<nicho>` ou o hub `/modelos-de-proposta-comercial`, guardar de onde a pessoa veio (nicho ou hub), junto com a origem já existente.

2. Registrar os cliques que importam (visitante anônimo)
   - Página de nicho vista
   - Modelo copiado
   - Clique em "Usar este modelo" / "Criar orçamento grátis" / "Começar grátis" (com a posição do botão: topo, modelo ou rodapé)
   - Clique em um nicho a partir do hub

3. Ligar o nicho ao resto do funil
   - No cadastro, o nicho de origem passa a acompanhar o evento de cadastro concluído.
   - Na criação da primeira proposta e no envio do link público, o mesmo nicho é anexado ao evento.
   - Assim o relatório mostra, por nicho: visitas → cliques no CTA → cadastros → propostas criadas → link público visto.

4. Painel no admin
   - Nova aba em Marketing: tabela por nicho com visitas, cliques, cadastros, propostas e taxa de conversão, com filtro de período (7/30/90 dias).

## Detalhes técnicos

- `product_events` ganha uma policy de INSERT para `anon` restrita a: `user_id IS NULL` e `event_name` dentro de uma lista fechada de eventos de marketing (`niche_page_viewed`, `niche_template_copied`, `niche_cta_clicked`, `hub_niche_clicked`), mais limite de tamanho nas propriedades. GRANT INSERT em `product_events` para `anon`.
- `src/lib/productEvents.ts`: `trackProductEvent` deixa de sair cedo quando não há usuário — passa a inserir com `user_id: null` apenas para os eventos da lista de marketing; qualquer outro evento continua exigindo usuário.
- `src/lib/attribution.ts`: novo campo `niche` na atribuição (mesmo TTL de 30 dias, sem sobrescrever se já existir) e helper `readNicheOrigin()`.
- `src/pages/NicheTemplate.tsx`: `useEffect` de view + tracking nos três CTAs e no botão de copiar. `src/pages/ProposalTemplates.tsx`: tracking dos links de nicho no hub.
- `src/pages/auth/Register.tsx`: após `persistSignupAttribution()`, dispara `signup_completed` com `{ niche }`. `useProposals.ts` e o fluxo de compartilhamento anexam `niche` às propriedades dos eventos já existentes.
- Relatório: função `get_admin_niche_funnel(days int)` security definer restrita a admin, agregando `product_events` por `properties->>'niche'`; consumida por uma nova aba em `AdminMarketing`.
- Nenhum IP ou dado pessoal novo é gravado. Texto do painel em pt-BR pelo i18n existente.
- Rodar `tsc --noEmit` ao final.
