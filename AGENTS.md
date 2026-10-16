# Project Rules (Orca)

## Scheduled email jobs (cron → edge functions)
- The daily scheduled email jobs (`send-activation-emails`, `send-coupon-nudge-email`, `send-proposal-followup`, `send-ebook-nurture-emails`) authenticate with the internal token stored in `public.internal_secrets` (key `email_queue_token`; RLS enabled, no public policies, service role/postgres bypass).
- Each function accepts either that token or the service role key. Never point cron jobs at `vault.decrypted_secrets` — the vault was empty, so every daily job silently 401'd and no scheduled email ever went out (found 2026-10-16).
- When adding a scheduled job, use the same `internal_secrets` token pattern and set `timeout_milliseconds := 60000` on the `net.http_post`.
