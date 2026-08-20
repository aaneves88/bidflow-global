create table public.ebook_nurture_log (
  id uuid primary key default gen_random_uuid(),
  ebook_lead_id uuid not null references public.ebook_leads(id) on delete cascade,
  step text not null check (step in ('day3_reinforce', 'day7_coupon')),
  sent_at timestamptz not null default now(),
  unique (ebook_lead_id, step)
);
grant select, insert, update, delete on public.ebook_nurture_log to service_role;
alter table public.ebook_nurture_log enable row level security;
create policy "Admins read ebook nurture log" on public.ebook_nurture_log for select to authenticated using (public.has_role(auth.uid(), 'admin'));
grant select on public.ebook_nurture_log to authenticated;