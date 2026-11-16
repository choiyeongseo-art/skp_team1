begin;
-- Guest hashes are generated from the existing HttpOnly visitor cookie.
create table if not exists public.busan_guest_event_saves (
 visitor_hash text not null check (visitor_hash ~ '^[a-f0-9]{64}$'),
 event_id text not null check (length(event_id) between 1 and 200),
 store_id text,
 saved_at timestamptz not null default now(),
 primary key(visitor_hash,event_id)
);
alter table public.busan_guest_event_saves enable row level security;
revoke all on public.busan_guest_event_saves from public,anon,authenticated;
grant select,insert,update,delete on public.busan_guest_event_saves to service_role;
grant select on public.busan_account_events to service_role;
create or replace function public.busan_event_save_snapshot(p_visitor text,p_exclude_user uuid default null)
returns jsonb language sql stable security invoker set search_path='' as $fn$
 select jsonb_build_object(
  'saved',coalesce((select jsonb_agg(jsonb_build_object('eventId',event_id,'storeId',store_id,'savedAt',extract(epoch from saved_at)*1000) order by saved_at desc) from public.busan_guest_event_saves where visitor_hash=p_visitor),'[]'::jsonb),
  'counts',coalesce((select jsonb_object_agg(event_id,n) from (
   select event_id,count(*) n from (
    select event_id from public.busan_guest_event_saves
    union all
    select event_id from public.busan_account_events where p_exclude_user is null or user_id<>p_exclude_user
   ) saves group by event_id
  ) totals),'{}'::jsonb)
 );
$fn$;
revoke all on function public.busan_event_save_snapshot(text,uuid) from public,anon,authenticated;
grant execute on function public.busan_event_save_snapshot(text,uuid) to service_role;
commit;
