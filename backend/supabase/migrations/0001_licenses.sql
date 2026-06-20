-- ClockForClaude — License store
-- Holds one row per Stripe subscription, keyed by a unique license key.
-- Access is service-role only (Edge Functions). No public/anon access.

create table if not exists public.licenses (
  id                     uuid primary key default gen_random_uuid(),
  license_key            text not null unique,
  email                  text not null,
  plan                   text not null default 'pro_monthly',
  status                 text not null default 'active'
                           check (status in ('active', 'past_due', 'canceled')),
  stripe_customer_id     text,
  stripe_subscription_id text unique,
  stripe_checkout_session_id text unique,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists licenses_email_idx on public.licenses (lower(email));
create index if not exists licenses_subscription_idx on public.licenses (stripe_subscription_id);

-- Keep updated_at fresh on every write.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists licenses_touch_updated_at on public.licenses;
create trigger licenses_touch_updated_at
  before update on public.licenses
  for each row execute function public.touch_updated_at();

-- Lock the table down: RLS on, no policies => only the service_role key
-- (used by Edge Functions) can read/write. Anon/auth clients get nothing.
alter table public.licenses enable row level security;
