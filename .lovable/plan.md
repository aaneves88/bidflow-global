
# Pre-Launch QA Pass — CloseFlow

Goal: validate every existing flow end-to-end before enabling Stripe billing. No new features; only fixes for issues found.

## Approach

Execute QA in three layers, in order:

1. **Static review** — read all flow-critical files and cross-check against the requirements list. Catches type errors, missing i18n keys, wrong query fields, RLS mismatches, dead routes, broken imports.
2. **Database / backend review** — query Supabase to confirm triggers, RLS, and seed data behave as the UI expects (trial grant, first-user-admin, public_code, status history).
3. **Live browser pass** — drive the preview through each flow at desktop, tablet, and mobile viewports. Capture console + network errors. Verify PT-BR strings, loading/empty/error states, and public proposal as anon.

For each issue: log severity (P0 blocker / P1 launch-blocker / P2 polish / P3 nice-to-have), root cause, and fix scope. Only P0/P1 get fixed in this pass; P2/P3 go into the QA checklist as known items.

## Scope checklist (mirrors the request)

```text
AUTH        signup · first-user→admin · login · logout · route guards
PLANS       trial auto-grant · plan limits enforcement · admin grant · expired UX
CLIENTS     CRUD · validation · list
PROPOSALS   CRUD · items · totals · status change · history log
PUBLIC      anon view · view tracking · accept flow · approved_at/viewed_at
SHARING     copy link · wa.me · client phone · default message PT-BR
PDF         export · totals · branding · layout
DASHBOARD   totals · pipeline · approved revenue · conversion · recent · refresh
ADMIN       overview · users · plans · statuses · settings · integrations · QA
I18N        PT-BR coverage · no EN leftovers · no placeholders
RESPONSIVE  375 · 768 · 1280
ERRORS      404 · invalid id · missing data · loading skeletons
```

## Files to read (static pass)

- `src/App.tsx`, `src/components/ProtectedRoute.tsx`, `src/contexts/AuthContext.tsx`
- `src/pages/auth/*`, `src/pages/Onboarding.tsx`
- `src/hooks/useCurrentPlan.ts`, `usePlanLimits.ts`, `usePlans.ts`, `useClients.ts`, `useProposals.ts`, `useProposalViews.ts`, `useProposalStatuses.ts`, `useAdminUsers.ts`, `useAppSettings.ts`
- `src/pages/clients/*`, `src/pages/proposals/*` (Form, View, Public, List)
- `src/pages/admin/*` (Overview, Users, Plans, Statuses, Integrations, QAChecklist, StripeIntegrationCard)
- `src/pages/Dashboard.tsx`, `src/pages/Landing.tsx`, `src/pages/Pricing.tsx`
- `src/lib/proposalPdf.ts`, `src/lib/format.ts`
- `src/i18n/locales/pt-BR/*.json` vs `en/*.json` — diff key sets, flag missing keys
- `supabase/functions/stripe-webhook/index.ts`, `stripe-create-checkout/index.ts`

## Backend checks (read-only SQL)

- Confirm `is_starter=true` plan exists with `trial_days=7`
- Confirm default `proposal_statuses` seeded (default + final flags)
- Spot-check a recent signup: profile row, `user_roles` row, `user_plans` trial row with `expires_at`
- Confirm `proposals.public_code` is generated and unique
- Run `supabase--linter` for RLS / security warnings

## Browser pass (preview)

Run each at 1280, 768, 375. One session as admin (first user), one fresh signup as normal user, one anon tab for public proposal.

1. Signup → expect trial banner, redirect to dashboard
2. Create client (valid + invalid), edit, delete
3. Create proposal, add items, totals recompute, save
4. Change status → verify `proposal_status_history` insert
5. Open proposal view → copy link → open anon → verify `proposal_views` insert and `viewed_at`
6. Accept on public page → verify `approved_at` and status flip
7. WhatsApp button → verify `wa.me/<digits>?text=...` with PT-BR default message and client phone
8. Export PDF → inspect file for totals, branding, layout overflow
9. Dashboard KPIs reconcile with raw counts
10. Admin: users list, grant plan, edit plan, edit statuses, integrations tab loads, QA checklist persists
11. 404 + invalid `/proposals/:id` + logged-out access to `/dashboard`
12. Logout → guards redirect to `/login`

## Deliverables (what I will return after the run)

1. **Issues table** — id, area, severity, repro, root cause
2. **Fixes applied** — file list + one-line description per fix (P0/P1 only)
3. **Deferred items** — P2/P3 added as unchecked rows on `/admin?tab=qa`
4. **Final QA checklist status** — pass/fail per scope row above
5. **Go/no-go recommendation** for enabling Stripe billing

## Out of scope

- New features, redesigns, copy rewrites beyond fixing broken/missing strings
- Stripe live transaction testing (covered by separate Stripe configuration step)
- Performance profiling beyond obvious regressions
