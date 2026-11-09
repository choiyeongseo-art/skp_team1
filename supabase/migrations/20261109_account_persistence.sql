begin;
create table public.busan_account_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
 language text not null check (language in ('ko','en','ja','zh','zh-TW')),
 updated_at timestamptz not null default now()
);
create table public.busan_account_events (
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 event_id text not null check (length(event_id) between 1 and 200),
 store_id text,
 saved_at timestamptz not null default now(),
 primary key(user_id,event_id)
);
create table public.busan_account_plans (
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 plan_id text not null check (length(plan_id) between 1 and 200),
 payload jsonb not null check (jsonb_typeof(payload)='object' and payload->>'id'=plan_id and octet_length(payload::text)<=1048576),
 updated_at timestamptz not null default now(),
 primary key(user_id,plan_id)
);
alter table public.busan_account_preferences enable row level security;
alter table public.busan_account_events enable row level security;
alter table public.busan_account_plans enable row level security;
create policy own_preferences on public.busan_account_preferences for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy own_events on public.busan_account_events for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy own_plans on public.busan_account_plans for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.busan_account_preferences,public.busan_account_events,public.busan_account_plans from anon,public;
grant select,insert,update,delete on public.busan_account_preferences,public.busan_account_events,public.busan_account_plans to authenticated;
commit;
