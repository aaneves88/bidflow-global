# CloseFlow — Product Context

## What is CloseFlow?

CloseFlow is a global proposal and light sales pipeline platform for small businesses, service providers, and solo professionals. It helps users create proposals, share them with clients, and track whether those proposals become approved deals or are lost.

It is more than a quote generator — it is a **light proposal CRM**.

## Who is it for?

- Solo service providers
- Freelancers
- Small service businesses
- Any professional who sends proposals or quotes and needs to track outcomes

## Why does it exist?

Small businesses and solo professionals often lack a structured way to:
- Create professional proposals quickly
- Share them with clients via a public link or WhatsApp
- Track which proposals are open, viewed, approved, or lost
- Understand their conversion rate and pipeline value

CloseFlow solves this by combining proposal creation with a lightweight commercial pipeline.

## Core User Flow

1. User registers → first user becomes admin
2. User creates a client
3. User creates a proposal for that client
4. User shares the proposal via public link or WhatsApp
5. Client views and accepts (or rejects) the proposal
6. User tracks proposal statuses and conversion in the dashboard

## Admin Model

- The **first registered user** automatically becomes the system admin
- Admin can manage users, plans, settings, and feature flags
- All integrations (Stripe, WhatsApp, branding) are configurable through admin settings
- No integration is hardcoded — everything is toggle-based

## Access Control Model

- **Roles**: Stored in a separate `user_roles` table (never on profiles)
- **Role types**: `admin`, `user`
- **Plan access**: Can be granted via Stripe subscription OR manual admin action
- **RLS**: All tables use Row-Level Security
- **Security definer function**: `has_role()` prevents recursive RLS policies

## Architectural Principles

- **Global-first**: English UI, i18n-ready, no locale-specific assumptions
- **Mobile-first**: Responsive design, touch-friendly
- **UUIDs internally**: All entities use UUID primary keys
- **Public codes, not slugs**: Public links use random codes, not fragile slug-based URLs
- **Normalized domain data**: Proposal statuses, plans, and settings are reusable entities
- **Centralized settings**: All configuration lives in `app_settings` table
- **No hardcoded integrations**: Everything is admin-configurable
- **Lean MVP, correct architecture**: Start small but structured for scale

## Design Principles

- Clean, professional, modern SaaS aesthetic
- Semantic design tokens via CSS variables
- Consistent component library (shadcn/ui)
- Accessible and keyboard-navigable
- Dark/light mode support planned
