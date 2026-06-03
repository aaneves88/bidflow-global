## Modelo Freemium "1ª proposta grátis" + Aba Roadmap no Admin

Adapta a lógica atual de planos para suportar limites e feature-flags por plano, aplica a regra "primeira proposta grátis", e adiciona uma aba **Roadmap** no Admin documentando o que já existe e o que está planejado.

---

### 1. Schema — feature flags por plano

Migration em `public.plans` adicionando colunas booleanas (nullable, default false):
- `allow_pdf_export`
- `allow_templates`
- `allow_custom_branding`

`max_proposals` e `max_clients` já existem — manter. Não criar regras hardcoded: tudo lido da tabela.

Backfill: planos pagos existentes recebem `allow_pdf_export=true`, `allow_custom_branding=true`. Starter mantém defaults.

### 2. Regra "primeira proposta grátis"

Adaptar `usePlanLimits.ts` para o seguinte cálculo de `canCreateProposal`:

```text
- isAdmin                                  → sempre permitido
- hasPlan && !isExpired && dentro do limite → permitido
- sem plano OU plano expirado:
    - proposalsUsed === 0                  → permitido (cota grátis)
    - proposalsUsed >= 1                   → bloqueado
```

Retornar também `freeProposalUsed: boolean` e `isOnFreeTier: boolean` para a UI.

Sem mudança de schema — a cota grátis é derivada da contagem existente de propostas.

### 3. Indicadores de uso

**Dashboard** (`src/pages/Dashboard.tsx`): card "Uso de propostas" mostrando:
- Free tier sem uso: "Você ainda possui 1 proposta gratuita disponível."
- Free tier usado: "Você já utilizou sua proposta gratuita." + botão "Ver planos"
- Com plano + limite: "X de Y propostas usadas neste plano"
- Com plano ilimitado: "Propostas ilimitadas"

**Tela de Propostas** (`src/pages/proposals/Proposals.tsx`): mesma mensagem em formato banner acima da lista.

### 4. Modal de upgrade

Novo componente `src/components/UpgradeModal.tsx` (shadcn `Dialog`):
- Título: "Limite gratuito atingido"
- Descrição: "Você já utilizou sua proposta gratuita. Para continuar criando propostas e acompanhar seus negócios, escolha um plano."
- Botões: "Ver planos" → `/pricing` · "Fazer upgrade" → `/pricing#plans` (destacado)

Disparado quando o usuário clica em **Nova Proposta** sem permissão. Substitui o bloqueio atual silencioso.

Pontos de integração: botão "Nova" em `Proposals.tsx`, atalho em `Dashboard.tsx`, e guarda dentro de `ProposalForm.tsx` ao montar em modo create.

**Não bloquear:** visualizar, editar, compartilhar, PDF e WhatsApp da proposta existente continuam liberados.

### 5. Aba "Roadmap" no Admin

Nova aba ao lado de QA em `src/pages/admin/Admin.tsx`:
- Componente `AdminRoadmap.tsx` que renderiza `docs/product-roadmap.md` parseado em fases.
- Fonte: nova chave em `app_settings` `roadmap_markdown` (texto) — editável inline por admin via textarea + preview.
- Inicialização: seed com o conteúdo atual de `docs/product-roadmap.md` + nova entrada de monetização.
- Renderização: badges coloridos por status (✅ / 🔄 / 📋), agrupado por fase.

Adicionar tradução `tabs.roadmap` em `admin.json` (pt-BR + en).

### 6. Atualizações documentais

- **`docs/product-roadmap.md`**: nova seção "Monetização" com itens (primeira proposta grátis ✅, feature flags por plano ✅, modal de upgrade ✅, billing fim-a-fim 🔄, customer portal 📋).
- **`AdminQAChecklist`**: nova seção `monetization` com itens:
  - "Novo usuário cria 1ª proposta grátis"
  - "2ª proposta dispara modal de upgrade"
  - "Plano ativo libera novas propostas"
  - "Admin sem limites"
  - "Plano concedido manualmente libera criação"
  - "Indicador de uso visível no Dashboard"
  - "Indicador de uso visível em Propostas"
- **`.lovable/plan.md`**: arquivar sprint anterior e registrar este como próximo entregue.

### 7. i18n

Novas chaves em `pt-BR` + `en`:
- `common:upgradeModal.*` (título, descrição, botões)
- `dashboard:usage.*` (4 variantes de mensagem)
- `proposals:usage.*` (mesmo)
- `admin:tabs.roadmap`, `admin:roadmap.*` (status labels, edit/save, preview)
- `admin:qa.sections.monetization.*`

### 8. Ordem de execução

```text
1. Migration: plans + feature flags + backfill
2. usePlanLimits: regra free tier + feature flags helpers
3. UpgradeModal + integração nos pontos de criação
4. Indicadores no Dashboard e Propostas
5. AdminRoadmap (aba + storage em app_settings)
6. Atualizar QA checklist + docs/product-roadmap.md + i18n
```

### Detalhes técnicos

- Sem novas dependências.
- Sem breaking changes: colunas novas são nullable; `canCreateProposal` mantém assinatura, só adiciona campos extras.
- `useAppSettings` já suporta `getSetting`/`upsert` — `roadmap_markdown` é só mais uma chave categoria `general`.
- Feature flags consumidas via helpers: `useFeatureFlag('allow_pdf_export')` que retorna `true` para admin, `true` se plano ativo libera, `false` caso contrário. Botão de PDF/templates/branding em proposta passa a checar isso (no MVP só exposto; bloqueio efetivo só se o admin desligar a flag no plano).
- Modal de upgrade reaproveitado em qualquer guarda futura (clientes, exports, etc.).
