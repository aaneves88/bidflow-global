# Project Rules (Orca)

## Customer help
- The authenticated help page filters the shared video catalog to tutorials and education, reuses its translated metadata, and has no plan/admin gate; this keeps customer help available to every plan without duplicating content.

## Homepage styling
- Scope the homepage theme to `.orca-landing` with semantic CSS variables so marketing design changes never retheme the authenticated app.
- Keep the homepage watermark in a page-owned fixed decorative layer so it remains continuous while scrolling and disappears when leaving the homepage.

## Scheduled email jobs (cron → edge functions)
- The daily scheduled email jobs (`send-activation-emails`, `send-coupon-nudge-email`, `send-proposal-followup`, `send-ebook-nurture-emails`) authenticate with the internal token stored in `public.internal_secrets` (key `email_queue_token`; RLS enabled, no public policies, service role/postgres bypass).
- Each function accepts either that token or the service role key. Never point cron jobs at `vault.decrypted_secrets` — the vault was empty, so every daily job silently 401'd and no scheduled email ever went out (found 2026-10-16).
- When adding a scheduled job, use the same `internal_secrets` token pattern and set `timeout_milliseconds := 60000` on the `net.http_post`.
