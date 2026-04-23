

# Phase 3 — Admin & Settings

Build the admin dashboard and settings interface so the system can be operated without code changes.

---

## 1. Admin Dashboard (`/admin`)

Replace the placeholder with a real admin page containing:

- **Users table**: list all users (from `profiles` joined with `user_roles`), showing name, email, role, registration date
- **Actions per user**: toggle admin role, grant/revoke plan manually
- **Stats cards**: total users, total proposals (system-wide), total approved revenue (system-wide)

No new database tables needed -- uses existing `profiles`, `user_roles`, `user_plans`, `plans`, `proposals`.

---

## 2. Admin Sub-routes

Expand `/admin` into sub-pages via tabs or nested routes:

- `/admin` — overview (stats + recent users)
- `/admin/users` — full users management
- `/admin/plans` — plans CRUD (create/edit/deactivate plans in `plans` table)
- `/admin/statuses` — manage `proposal_statuses` (reorder, rename, change colors)

All protected with `requireAdmin`.

---

## 3. Settings Page (`/settings`)

Replace the placeholder with a tabbed settings interface reading/writing from `app_settings`:

- **General tab**: company name, default currency
- **Integrations tab**: Stripe enabled/disabled, WhatsApp enabled/disabled + phone number
- **Branding tab**: logo URL, primary color (future use)

Each tab loads settings by category from `app_settings` and saves via upsert.

---

## 4. Plans Management (Admin)

- Table listing all plans (name, price, currency, interval, active/inactive)
- Create/edit dialog with fields: name, description, price, currency, interval, features (JSON editor or tag input), is_active toggle
- Soft-delete via `is_active = false`

---

## 5. User Plans Management (Admin)

- On the users detail or from users list, admin can "Grant Plan" to a user
- Dialog: select plan, set start/end dates, status
- Inserts into `user_plans` with `granted_by = admin's UUID`
- Show current plan badge on user row

---

## 6. Proposal Statuses Management (Admin)

- Sortable list of `proposal_statuses`
- Edit name, color (color picker), position, is_default, is_final flags
- Add new status, reorder via drag or position input

---

## 7. Database Changes

- **New RLS policy on `proposal_statuses`**: allow anon SELECT (public proposal page needs statuses)
- **New RLS policy on `profiles`**: admin INSERT for system operations (already has admin SELECT)
- No new tables required

---

## 8. Roadmap Update

Mark Phase 3 items as "in progress" in `docs/product-roadmap.md`.

---

## Technical Details

- Admin pages use `useAuth().isAdmin` guard + `requireAdmin` on routes
- Settings use a custom `useAppSettings` hook that queries/upserts `app_settings` by category
- Plans CRUD uses a `usePlans` hook with react-query
- Users management queries `profiles` joined with `user_roles` (admin can see all via existing RLS)
- All forms use shadcn/ui `Dialog`, `Form`, `Input`, `Select`, `Switch` components
- Color picker for statuses uses a simple hex input or predefined palette

