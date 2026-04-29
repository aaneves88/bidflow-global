
# Plano — Tradução pt-BR + Phase 4 (Commercial Readiness)

CloseFlow continua como marca global. Lançamento comercial em **Português do Brasil**, com arquitetura preparada para futuras línguas. Código, banco e identificadores permanecem em inglês.

---

## Parte 1 — Internacionalização (i18n) e tradução pt-BR

### 1.1 Stack de i18n

- Adicionar `i18next` + `react-i18next` (leve, padrão de mercado, suporta interpolação e plurais).
- Idioma padrão: `pt-BR`. Fallback: `en`.
- Detecção: localStorage > navegador > pt-BR.
- Inicialização em `src/i18n/index.ts`, importado uma vez no `main.tsx`.

### 1.2 Estrutura de arquivos de tradução

```text
src/i18n/
  index.ts                  # init i18next
  locales/
    pt-BR/
      common.json           # botões, ações, validações genéricas
      landing.json
      auth.json
      dashboard.json
      clients.json
      proposals.json
      public.json           # página pública da proposta
      settings.json
      admin.json
      pricing.json
      onboarding.json
    en/
      (mesma estrutura, traduzido)
```

Namespaces por área evitam JSON gigante e permitem code-splitting futuro.

### 1.3 Padrões de uso

- Uso via hook: `const { t } = useTranslation('dashboard')`.
- Chaves hierárquicas: `t('kpis.approvedRevenue')`.
- Datas/moedas: atualizar `src/lib/format.ts` para usar `pt-BR` por padrão (`Intl.NumberFormat('pt-BR', { currency: 'BRL' })`) lendo o currency das settings.
- Plurais com `t('proposals_one' / 'proposals_other', { count })`.

### 1.4 Escopo de tradução (todas as áreas user-facing)

Landing, Auth (login/register), Dashboard, Clients (lista, dialog, validações), Proposals (lista, form, view, public), Settings (todas as abas), Admin (overview, users, plans, statuses), Pricing (nova), Onboarding (nova), AppSidebar, NotFound, toasts e mensagens de validação de formulários.

Tom: claro, prático, voltado a pequenos negócios. Ex.: "Criar proposta", "Enviar pelo WhatsApp", "Aprovada", "Receita aprovada", "Taxa de conversão", "Acessar painel".

### 1.5 Marca

"CloseFlow" permanece em todos os idiomas. Tagline pt-BR: *"Propostas e pipeline de vendas para pequenos negócios."*

---

## Parte 2 — Phase 4: Commercial Readiness

### 2.1 Página de preços (`/pricing`)

- Rota pública nova, link no nav da landing e no header autenticado.
- Lê os planos ativos da tabela `plans` (já existe).
- Cards comparativos: nome, preço, intervalo, features (do JSON), CTA.
- CTA depende do estado:
  - Visitante → "Começar agora" → leva ao registro com `?plan=<id>`.
  - Logado sem plano pago → "Assinar" → inicia checkout Stripe.
  - Logado com plano ativo → "Plano atual" desabilitado.
- Toggle mensal/anual se houver planos com `interval` diferentes.

### 2.2 Onboarding pós-signup (`/onboarding`)

Fluxo simples de 3 passos exibido na primeira sessão após registro:

1. **Boas-vindas** — nome do negócio (atualiza `profiles.full_name` se vazio + cria entrada em `app_settings` `branding.company_name` se for o admin).
2. **Primeiro cliente** (opcional, com "Pular").
3. **Primeira proposta** (opcional, com "Pular") → leva ao `ProposalForm`.

Marcador de conclusão: chave `onboarded_at` em `profiles` via novo campo, OU armazenar em `localStorage` por simplicidade. **Decisão:** usar localStorage por usuário (sem mudança de schema, atende ao requisito "simples"). Quem quiser refazer pode acessar `/onboarding` direto.

Redirecionamento: após registro bem-sucedido → `/onboarding` em vez de `/dashboard`.

### 2.3 Modelo de trial / starter

- Ao criar usuário (trigger `handle_new_user`), conceder automaticamente o plano marcado como **starter** em `plans` (nova flag `is_starter boolean`) por X dias (campo novo em plans: `trial_days int default 0`).
- Insert em `user_plans` com `expires_at = now() + trial_days`.
- Se nenhum plano starter existir, usuário fica sem plano (acesso limitado).

**Mudanças de banco (migration):**
```sql
ALTER TABLE plans ADD COLUMN is_starter boolean DEFAULT false;
ALTER TABLE plans ADD COLUMN trial_days int DEFAULT 0;
ALTER TABLE plans ADD COLUMN max_proposals int; -- null = ilimitado
ALTER TABLE plans ADD COLUMN max_clients int;   -- null = ilimitado

-- Atualiza handle_new_user para conceder starter
```

Admin UI (`AdminPlans`): novos campos no formulário (starter switch, trial days, limites).

### 2.4 Controle de acesso por plano

- Hook novo `useCurrentPlan()` — retorna plano ativo do usuário (join `user_plans` + `plans`), expiração e flags.
- Hook `usePlanLimits()` — retorna `{ canCreateProposal, canCreateClient, proposalsUsed, clientsUsed, ... }`.
- Aplicar bloqueios:
  - Botão "Nova proposta" desabilitado quando atingiu limite, com tooltip + CTA para `/pricing`.
  - Mesmo para clientes.
  - Banner global se plano expirado: "Seu período de teste terminou — escolha um plano".
- Admin sempre tem acesso total (bypass via `isAdmin`).

### 2.5 Stripe checkout configurável

Stripe será habilitado via integração nativa do Lovable (`enable_stripe_payments`) **somente após aprovação do usuário neste plano**. Como o usuário ainda não confirmou, o plano contempla:

- **Etapa A (este passo):** estrutura preparada — settings `integrations.stripe.enabled` lido do `app_settings`; botão "Assinar" só aparece quando habilitado; quando desabilitado, mostra mensagem "Em breve" ou contato manual.
- **Etapa B (após aprovação):** rodar `recommend_payment_provider` → `enable_stripe_payments` → criar produtos via `batch_create_product` espelhando os planos → edge function `create-checkout` que recebe `plan_id`, busca preço Stripe e cria sessão → webhook que ativa `user_plans` ao confirmar pagamento.

Pergunto sobre habilitação do Stripe agora ou depois (ver perguntas no fim).

### 2.6 Tracking de visualização de proposta

**Mudança de banco:**
```sql
CREATE TABLE proposal_views (
  id uuid PK default gen_random_uuid(),
  proposal_id uuid NOT NULL,
  viewed_at timestamptz NOT NULL default now(),
  user_agent text,
  ip_hash text  -- hash, sem PII
);

-- RLS
-- INSERT público (anon) com check do proposal existir
-- SELECT só pelo dono da proposta
```

- `PublicProposal` registra view no mount (uma vez por sessão via sessionStorage).
- `ProposalView` (interno) mostra: nº de visualizações, primeira/última view.
- Indicador "Visualizada" na lista de propostas (badge azul claro).

### 2.7 KPIs do dashboard

Refinar `Dashboard.tsx` com 3 KPIs financeiros principais (em pt-BR):

- **Pipeline em aberto (R$)**: soma de `total_amount` das propostas com status não-final.
- **Receita aprovada (R$)**: soma das propostas com status "Aprovada" (já existe, formalizar).
- **Taxa de conversão (%)**: aprovadas / total enviadas (excluindo rascunhos).

Adicionar filtro de período: Este mês / Últimos 30 dias / Este ano (state local, sem mudança de banco).

### 2.8 Roadmap update

Marcar como ✅ completed em `docs/product-roadmap.md`:
- Pricing page
- Simple onboarding
- Trial or starter plan
- Access control by plan
- Viewed proposal tracking
- Pipeline value
- Approved revenue
- Conversion rate

E marcar **Stripe checkout** como ✅ ou 🔄 conforme a decisão sobre habilitação.

---

## Detalhes técnicos

- i18n: `i18next` + `react-i18next` + `i18next-browser-languagedetector`.
- Novos hooks: `useCurrentPlan`, `usePlanLimits`, `useProposalViews`.
- Nova tabela: `proposal_views` (com RLS apropriada).
- Novas colunas em `plans`: `is_starter`, `trial_days`, `max_proposals`, `max_clients`.
- `handle_new_user` atualizado para conceder starter automaticamente.
- Nova rota pública: `/pricing`.
- Nova rota autenticada: `/onboarding`.
- `formatCurrency` passa a aceitar locale e ler `BRL` por padrão.
- Sem alterações em `client.ts`, `types.ts` (regenerado), `config.toml`.
- Stripe: estrutura preparada; ativação real depende da resposta da pergunta abaixo.

---

## Perguntas antes de implementar

1. **Stripe agora?** Habilito a integração de pagamentos do Lovable (Stripe) já nesta etapa ou deixo só a estrutura pronta para ativar depois?
2. **Moeda padrão:** travo em **BRL** para o lançamento brasileiro, ou mantenho a moeda configurável em `app_settings` (admin escolhe BRL/USD/EUR)?
3. **Trial:** plano starter dá **14 dias grátis** com limites (5 propostas, 10 clientes), ou plano free permanente com limites menores (3 propostas/mês)?

Posso seguir com defaults sensatos (Stripe estrutura-only, BRL padrão configurável, 14 dias de trial 5/10) se preferir não responder agora.
