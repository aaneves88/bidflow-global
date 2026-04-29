
# Commercial launch prep for CloseFlow

Goal: make the app sellable and usable today. No new heavy features — finish what exists, add the Starter plan in DB, polish proposal sharing, add a basic PDF, and give admin a QA checklist.

## 1. Seed the Starter plan in the database

The `plans` table is currently empty. Insert the commercial Starter plan via migration so it exists in every environment and `handle_new_user` can auto-grant it on signup.

```text
plans row:
  name           = "Starter"
  description    = "Plano ideal para pequenos negócios..."
  price          = 29.90
  currency       = "BRL"
  interval       = "month"
  is_starter     = true
  is_active      = true
  trial_days     = 7
  max_proposals  = null  (unlimited during launch)
  max_clients    = null
  features       = ["Propostas ilimitadas", "Link público", "WhatsApp", "PDF", "Acompanhamento de visualizações"]
```

Notes:
- All pricing/limits stay in the DB. App reads via `usePlans` / `useCurrentPlan` (already does).
- Admin can edit price, deactivate, change limits at `/admin?tab=plans` (already implemented).
- Stripe `price_id` mapping done at `/admin?tab=integrations` (already implemented).
- The internal "code" `starter_monthly` isn't a column today; we'll skip adding a schema change for it — `is_starter=true` already uniquely identifies this plan. If you want a stable code later we can add a column.

## 2. Trial / starter access

Already wired, just confirming the model:
- `user_plans` table holds access (acts as the requested `user_plan_access`).
- `status = 'active'` with an `expires_at` represents an active trial or paid subscription. We don't need a separate `access_type` column — `expires_at` + relation to a starter plan tells us it's a trial.
- `handle_new_user` trigger already grants the starter plan with `expires_at = now() + trial_days` on signup.
- `usePlanLimits` blocks creation when no plan or expired.
- Admin can extend / override via `/admin?tab=users` (existing UI updates `user_plans`).

After seeding the Starter plan, every new signup automatically gets a 7-day trial. No code changes needed here.

## 3. Stripe activation polish

Current flow works (`stripe-create-checkout` + `stripe-webhook`). Two small hardenings:

- **Idempotency in webhook**: when `checkout.session.completed` arrives, mark prior active `user_plans` rows for that user as `status = 'replaced'` before inserting the new one, so `useCurrentPlan` (which orders by `starts_at desc` and filters `status='active'`) always returns the latest paid plan. Avoids stacking trial + paid simultaneously.
- **Handle `customer.subscription.deleted`**: when a subscription is cancelled, mark the matching `user_plans` row `status = 'cancelled'`. Lookup by `metadata.user_id` + `metadata.plan_id`.
- Keep BYOK Stripe (already enabled, secrets present). No provider change.

Pricing page already calls the edge function correctly. No changes to `Pricing.tsx`.

## 4. Proposal sharing improvements

Edit `src/pages/proposals/ProposalView.tsx`:

- **Copy public link button**: already exists as an icon — promote to a labeled button "Copiar link" so it's discoverable.
- **WhatsApp button**: change `wa.me/` (no number) to `wa.me/{phone}` when the client has a phone. Strip non-digits from `client.phone`. Fallback to `wa.me/` (contact picker) when phone is missing.
- **Default WhatsApp message** (i18n key, pt-BR):
  ```
  Olá {clientName}, segue a proposta "{title}" no valor de {total}.
  Você pode visualizar e aceitar pelo link: {url}
  Qualquer dúvida estou à disposição.
  ```
- Show both buttons full-width on mobile (current viewport is narrow).

The public link remains the primary share surface — these are just better entry points to it.

## 5. PDF export (MVP-friendly)

Add a "Baixar PDF" button on `ProposalView` and on `PublicProposal` (so the client can download too).

Implementation: client-side, no new edge function.
- Add deps: `jspdf` + `jspdf-autotable` (small, no native deps).
- New helper `src/lib/proposalPdf.ts` exporting `generateProposalPdf(proposal, items, settings)` that:
  - Header: company name from `app_settings` (if set) + proposal title
  - Client block: name, company, email, phone
  - Items table via autoTable: description, qty, unit price, total
  - Total row, validity date, footer with public link
  - Saves as `proposta-{public_code}.pdf`
- Single page-break-aware layout, no fancy theming. Good enough for a "formal quote" attachment.

If a paid plan in the future should gate PDF, we can hook into `usePlanLimits` later — leave open for all users at launch.

## 6. Admin QA checklist page

New tab in `/admin?tab=qa` — read-only checklist rendered from a static config in code (not DB). Each item is a checkbox with persistence in `localStorage` per admin user.

Sections:
- **Auth**: signup, login, logout, first user becomes admin, Google login (if enabled).
- **Trial**: new user gets 7-day Starter, blocked after expiry.
- **Plans**: admin can create/edit/deactivate plans; pricing reflects in `/pricing`.
- **Stripe**: integration card saves; checkout opens; test purchase activates plan; webhook URL configured in Stripe dashboard.
- **Clients**: create, edit, delete, search.
- **Proposals**: create with items, edit, status change recorded in history, valid_until.
- **Sharing**: copy link works, WhatsApp opens with client number + message, public page loads, view counted, accept flow updates status.
- **PDF**: download from owner view and from public page.
- **i18n**: switch language, no missing keys in main flows.
- **Mobile**: all main pages usable at 375px width.

Each item: title, description, "Open page" link where applicable. Submit button at the bottom shows completion %.

Add tab to `Admin.tsx` and i18n strings under `admin.tabs.qa` + `admin.qa.*` (pt-BR + en).

## Technical notes

- Migration: insert one row into `plans`. No schema change.
- Edge function update: `supabase/functions/stripe-webhook/index.ts` — add `update user_plans set status='replaced'` before insert; add `customer.subscription.deleted` handler.
- New file: `src/lib/proposalPdf.ts`.
- New file: `src/pages/admin/AdminQAChecklist.tsx`.
- Edits: `ProposalView.tsx`, `PublicProposal.tsx` (PDF button), `Admin.tsx` (new tab), i18n JSONs (`proposals`, `admin`, `pt-BR` + `en`).
- New deps: `jspdf`, `jspdf-autotable`.

## Out of scope (deliberately, to ship)

- Renaming `user_plans` → `user_plan_access`. Existing table already covers the same need; renaming would touch many files for zero user value.
- Adding a `code` column on plans (`starter_monthly`). Not used anywhere in code today.
- Server-side PDF generation. Client-side jsPDF is enough for MVP.
- WhatsApp Cloud API, Resend, Pix — kept as roadmap items for after launch.
