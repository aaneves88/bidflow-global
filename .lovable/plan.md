

# Phase 2 — MVP Core

Everything needed to make CloseFlow a usable, sellable product.

---

## 1. Database: New Tables

**clients**
- id (UUID), user_id (ref auth.users), name, email, phone, company, notes, created_at, updated_at

**proposals**
- id (UUID), user_id, client_id (ref clients), public_code (unique, random 12-char), title, description, currency, total_amount, status_id (ref proposal_statuses), valid_until (nullable), created_at, updated_at

**proposal_items**
- id (UUID), proposal_id (ref proposals), description, quantity, unit_price, total, position, created_at

**proposal_status_history**
- id (UUID), proposal_id (ref proposals), status_id (ref proposal_statuses), changed_by (nullable UUID), notes, created_at

RLS policies on all tables: users can only CRUD their own clients and proposals. Public page reads proposals by public_code without auth.

Trigger: when proposal status_id changes, auto-insert into proposal_status_history.

Enable realtime on proposals table for future use.

---

## 2. Clients Module

- **List page** (`/clients`): searchable table with name, email, company, phone, proposal count
- **Create/Edit dialog**: form with name (required), email, phone, company, notes
- **Delete** with confirmation
- All operations via Supabase with react-query

---

## 3. Proposals Module

- **List page** (`/proposals`): table with title, client name, status badge (colored), total, date, actions
- **Create/Edit page** (`/proposals/new`, `/proposals/:id/edit`): 
  - Select client (or create inline)
  - Title, description, currency, valid_until
  - Line items editor (add/remove rows, auto-calculate totals)
  - Status selector
- **View page** (`/proposals/:id`): full proposal detail with status history timeline, actions (change status, copy public link, WhatsApp send)

---

## 4. Proposal Public Page

- Route: `/p/:publicCode` (no auth required)
- Clean, professional read-only view of the proposal
- Shows: company info, client info, line items, total, status
- "Accept Proposal" button that changes status to Approved
- WhatsApp button to contact the sender
- No app chrome (no sidebar, no header)

---

## 5. Dashboard

- Welcome message with user name
- KPI cards:
  - Total proposals (this month)
  - Open proposals (pending)
  - Approved value (sum of approved proposals)
  - Conversion rate (approved / total)
- Recent proposals list (last 5)
- Mini pipeline: status distribution as a simple bar or column chart

---

## 6. Status History

- Timeline component on proposal detail page
- Shows each status change with timestamp, who changed it, and optional notes

---

## 7. Routing Updates

New routes in App.tsx:
- `/proposals/new` — create proposal
- `/proposals/:id` — view proposal
- `/proposals/:id/edit` — edit proposal  
- `/p/:publicCode` — public proposal page (no auth)

---

## 8. Update Roadmap

Mark Phase 1 items as completed, Phase 2 items as in progress.

---

## Technical Details

- All queries use `@tanstack/react-query` with Supabase client
- Public code generation: `crypto.randomUUID().replace(/-/g, '').slice(0, 12)`
- Currency formatting with `Intl.NumberFormat`
- Status badges use colors from `proposal_statuses.color`
- WhatsApp link: `https://wa.me/?text=...` with proposal public URL
- Line items use controlled form state with add/remove/reorder

