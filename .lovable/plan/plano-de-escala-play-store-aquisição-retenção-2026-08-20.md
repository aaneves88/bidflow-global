# Plano de escala — Play Store + aquisição + retenção

Objetivo: sair do estágio atual (web funcional, mobile em andamento) para um ciclo de crescimento sustentável de usuários, com o Android na Play Store como primeiro canal de escala.

## 1. Publicar na Google Play Store (v0.6.1)

O que falta hoje: a infra mobile existe (`capacitor.config.ts`, `useRevenueCat`, `MobilePaywall`, webhook), mas o app ainda não foi gerado como projeto Android e o `assetlinks.json` está com placeholder.

Entregáveis:

- Gerar e commitar a pasta `android/` (`npx cap add android`) com ícones adaptive, splash e nome localizado.
- Substituir o SHA-256 em `public/.well-known/assetlinks.json` pelo fingerprint real da Play Console.
- Criar/atualizar assets de loja: ícone 512x512, feature graphic 1024x500, 6+ screenshots em pt-BR.
- Revisar descrição longa, tagline e palavras-chave em `docs/marketing/app-description-pt.md`.
- Preencher Data Safety form (declarar email, nome, dados de pagamento via Google Play).
- Criar produtos de assinatura na Play Console e mapear `rc_product_id` nos metadados dos planos.
- Subir para teste fechado com 12+ testers e aguardar os 14 dias obrigatórios.

## 2. Ligar o motor de aquisição (v0.8.0-aquisição)

A maior dor operacional é atrair usuários. Hoje a landing converte cadastro, mas não há mecanismo de viralização ativa além do compartilhamento de propostas.

Entregáveis:

- **Programa de indicação**: aproveitar as tabelas `referral_partners` e `referral_payouts` já existentes. Criar página `/convidar` com link de indicação personalizado, créditos para quem indica e desconto para quem entra pelo link.
- **SEO de longa cauda**: criar páginas `/modelos/<caso-de-uso>` (ex.: proposta para social media, consultoria, fotografia, arquitetura) com templates prontos e CTA para usar.
- **E-book + leads**: aproveitar `Ebook.tsx` e `ebook_leads` com campanha de anúncios direcionada a freelancers no Instagram/Meta.
- **Depoimentos sociais**: adicionar seção "Quem usa" na landing com casos reais (mesmo que iniciais).
- **CTA de app na landing**: banner para instalar o app Android após publicação.

## 3. Aumentar conversão e retenção (v0.8.1)

Funcionalidades que reduzem abandono e aumentam o valor percebido:

- **Lembretes inteligentes de follow-up**: notificar o usuário quando o cliente abre a proposta e sugerir mensagem de WhatsApp 24h depois.
- **Dashboard pessoal mais forte**: mostrar "propostas pendentes", "quem abriu hoje", "receita prevista" logo no login.
- **Templates por nicho**: expandir os 3 modelos de proposta para 6-8 casos de uso (social media, fotografia, consultoria, etc.).
- **Mini-curso no onboarding**: 3 dicas por email nos primeiros 7 dias para levar à primeira proposta.
- **Avaliação NPS**: coletar feedback aos 15 dias de uso.

## 4. Métricas e decisões

Instalar um painel simples no admin:

- CAC por canal (UTM já existem).
- Taxa de ativação (criou primeira proposta em 7 dias).
- Taxa de conversão free → pago.
- Churn de assinaturas.
- NPS médio.

## Ordem sugerida de execução

1. Play Store (Android) — desbloqueia um canal de escala.
2. Programa de indicação — aproveita usuários atuais para trazer novos.
3. SEO de modelos + e-book — tráfego orgânico e pago recorrente.
4. Retenção/follow-up — aumenta LTV e justifica investimento em aquisição.

## O que NÃO está no escopo

- iOS/App Store (mantido como próximo marco após Android estabilizar).
- Novos gateways de pagamento (Stripe web + RevenueCat mobile já cobrem).
- Refatoração grande de UI (mudanças pontuais apenas).
