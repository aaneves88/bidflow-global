create table public.product_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  properties jsonb,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  referrer text,
  created_at timestamptz not null default now()
);

grant insert on public.product_events to authenticated;
grant select on public.product_events to authenticated;
grant all on public.product_events to service_role;

alter table public.product_events enable row level security;

create policy "Users insert their own product events"
  on public.product_events for insert to authenticated
  with check (user_id = auth.uid());

create policy "Admins read product events"
  on public.product_events for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create index product_events_event_name_idx on public.product_events (event_name);
create index product_events_created_at_idx on public.product_events (created_at desc);