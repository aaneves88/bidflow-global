

# CloseFlow — Phase 1: Foundation

## O que vamos construir

Toda a base estrutural do CloseFlow: documentação do produto, shell do app, autenticação, sistema de roles, modelo de dados e configurações centralizadas.

---

## 1. Documentação do Produto

Criar dois arquivos internos no repositório:

- **`docs/product-context.md`** — Visão, público-alvo, princípios de arquitetura, modelo de acesso, regras de admin, design global-first
- **`docs/product-roadmap.md`** — Roadmap completo das 6 fases com marcadores de status (planned/in progress/completed)

---

## 2. Branding & App Shell

- Nome: **CloseFlow**
- Atualizar `index.html` com título e meta tags do CloseFlow
- Criar layout principal com sidebar navigation (colapsável no mobile)
- Módulos na navegação: **Dashboard, Clients, Proposals, Admin, Settings**
- Design limpo, profissional, mobile-first
- Textos em inglês, centralizados para futura i18n (arquivo de constantes)

---

## 3. Estrutura de Módulos

Organizar o projeto:
```
src/pages/auth/        → Login, Register
src/pages/dashboard/   → User dashboard
src/pages/clients/     → (placeholder)
src/pages/proposals/   → (placeholder)
src/pages/admin/       → (placeholder)
src/pages/settings/    → (placeholder)
```

Rotas protegidas por autenticação. Rotas admin protegidas por role.

---

## 4. Autenticação (Supabase via Lovable Cloud)

- Ativar Supabase com Lovable Cloud
- Login por email/senha
- Registro com criação automática de perfil
- **Primeiro usuário registrado vira admin** (trigger ou lógica no registro)
- Página de login e registro com branding CloseFlow

---

## 5. Modelo de Dados (Supabase)

### Tabelas:

**profiles**
- id (UUID, ref auth.users)
- full_name, email, avatar_url, created_at

**user_roles** (tabela separada — segurança)
- id, user_id (ref auth.users), role (enum: admin, user)
- RLS + função `has_role()` security definer

**plans**
- id, name, description, features (jsonb), price, currency, interval, is_active, created_at

**user_plans** (acesso manual ou por assinatura)
- id, user_id, plan_id, granted_by (nullable — admin ou stripe), status (active/cancelled/expired), starts_at, expires_at

**proposal_statuses** (dados de domínio reutilizáveis)
- id, name, color, position, is_default, is_final, created_at

**app_settings** (configurações centralizadas)
- id, key (unique), value (jsonb), category (general/stripe/whatsapp/branding), updated_at

RLS em todas as tabelas. Policies adequadas por role.

---

## 6. Configurações Centralizadas

- Seed inicial de `app_settings` com chaves padrão:
  - `stripe_enabled`, `whatsapp_enabled`, `default_currency`, `company_name`
- Seed de `proposal_statuses`: Draft, Sent, Viewed, Approved, Rejected, Expired

---

## 7. Páginas Iniciais Funcionais

- **Login/Register** — com branding CloseFlow
- **Dashboard** — shell com boas-vindas e espaço para futuros KPIs
- **Placeholders** para Clients, Proposals, Admin, Settings — estrutura pronta para Phase 2

---

## 8. Persistência de Memória

Salvar no projeto as regras de produto, preferências de design e roadmap para guiar todas as sessões futuras.

---

## Resultado esperado

Ao final: app funcional com login, registro, primeiro-user-admin, navegação modular, modelo de dados normalizado, documentação interna, e base arquitetural sólida para o MVP (Phase 2).

