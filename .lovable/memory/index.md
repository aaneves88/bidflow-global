# Project Memory

## Core
Product: Orca (formerly CloseFlow) — light proposal CRM for small businesses. Brand stays in English globally.
First commercial launch: Brazilian Portuguese (pt-BR). UI translated via i18next; default lang pt-BR, fallback en.
Brand is feminine in pt-BR ("a Orca"). Public app URL: https://orca-mento.app.
Mascot/logo: front-facing symmetrical orca head (V3), geometric minimalist, ocean palette (slate #0F172A, cyan #06B6D4, mint #F0FDFA). Assets in src/assets/brand/.
First registered user becomes admin. Roles in separate user_roles table, never on profiles.
UUIDs internally, public codes (not slugs) for shared links. Centralized app_settings table.
Mobile-first, clean SaaS aesthetic. shadcn/ui components. Semantic design tokens only.
Lovable Cloud (Supabase) for backend. All integrations admin-configurable.
All user-facing strings via useTranslation; never hardcode. Default currency BRL, configurable.
Every wave generates a release doc + version bump — see releases-process memory.

## Memories
- [Product context](mem://features/product-context) — Vision, audience, principles, access model
- [Product roadmap](mem://features/product-roadmap) — 6-phase roadmap with status markers
- [Architecture rules](mem://constraints/architecture) — Key technical constraints and patterns
- [i18n setup](mem://features/i18n) — i18next stack, namespaces per area, locales pt-BR + en
- [Releases process](mem://features/releases-process) — Every wave produces a versioned release doc + marketing updates
