# CloseFlow Demo Video — English Edition

Build a polished English-language version of the CloseFlow product demo, reusing the existing Remotion scaffold from the pt-BR render. Target ~100 seconds, 1920×1080, 30fps, silent (on-screen captions tell the story).

## Approach

Reuse the existing `remotion/` project. Duplicate the scene set into an English variant rather than overwriting — this keeps the pt-BR `closeflow-demo.mp4` intact and lets us re-render either language later.

- New composition id: `main-en`
- New entry scenes under `remotion/src/scenes-en/` (copies of the 9 pt-BR scenes with English copy + English UI labels in mockups)
- New `MainVideoEn.tsx` wired into `Root.tsx` alongside the existing composition
- Output: `/mnt/documents/closeflow-demo-en.mp4`

## Story & Captions (English)

1. **Hook (6s)** — "Proposals are still a mess." Floating WhatsApp / Word / spreadsheet fragments.
2. **Intro (4s)** — Logo + "Meet CloseFlow — a lightweight proposal CRM for small businesses."
3. **Dashboard (12s)** — KPI cards animate in: Pipeline, Approved Revenue, Conversion Rate + recent proposals list. Caption: "See your pipeline, revenue, and conversion at a glance."
4. **Clients (8s)** — Client list → "New client" dialog. Caption: "Manage every client in one place."
5. **New Proposal (14s)** — Form, line items appear, total auto-calculates. Caption: "Build proposals in seconds. Totals update automatically."
6. **Share (10s)** — Public link copied → WhatsApp share → PDF export. Caption: "Share via link, WhatsApp, or PDF."
7. **Accept (8s)** — Public proposal page, customer clicks "Accept". Caption: "Customers accept with one click."
8. **Dashboard Update (8s)** — Revenue counter ticks up, conversion rate increases. Caption: "Watch your business grow in real time."
9. **CTA (8s)** — "CloseFlow" + tagline "Create proposals. Track deals. Close more business."

Total: ~78s of scene content + transition overlaps → composition duration ~2700–3000 frames (~90–100s).

## English UI in Mockups

All mockup labels translated:
- Sidebar: Dashboard, Clients, Proposals, Settings
- KPIs: Pipeline, Approved Revenue, Conversion Rate, Active Proposals
- Buttons: New client, New proposal, Share, Copy link, Accept proposal, Download PDF
- Status badges: Draft, Sent, Accepted, Rejected
- Currency stays BRL→USD ($) for the English version with realistic sample numbers (e.g. $48,200 pipeline, $12,800 approved, 34% conversion).

## Visual System (unchanged from pt-BR build)

- Palette: bg `#0B0D10`, surface `#14171C`, primary `#3B82F6`, success `#22C55E`, text `#F5F5F4`
- Type: Inter (body) + Space Grotesk (display) via `@remotion/google-fonts`
- Motion: blur-to-sharp entrances, spring overshoot on hero moments, wipe + crossfade transitions between scenes
- Captions: bottom-aligned, Inter Medium, fade + subtle Y-translate

## Files to create

- `remotion/src/MainVideoEn.tsx`
- `remotion/src/scenes-en/01_Hook.tsx` … `09_CTA.tsx` (9 files)
- `remotion/src/captions-en.ts` — central English caption strings

## Files to edit

- `remotion/src/Root.tsx` — register second `<Composition id="main-en" component={MainVideoEn} />`
- `remotion/scripts/render-remotion.mjs` — accept composition id via env (`COMP_ID`) and output path (`OUT`) so we can render either language

## Rendering

```
cd remotion && COMP_ID=main-en OUT=/mnt/documents/closeflow-demo-en.mp4 node scripts/render-remotion.mjs
```

Spot-check frames at scenes 3, 5, 7, 9 via `bunx remotion still` before final render.

## Deliverable

`/mnt/documents/closeflow-demo-en.mp4` — 1920×1080, 30fps, H.264, muted, ~95s. Original pt-BR file untouched.
