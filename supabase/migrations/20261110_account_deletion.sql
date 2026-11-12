begin;
-- No caller-supplied user ID. The verified JWT subject is the only deletion target.
create or replace function public.busan_delete_my_account(p_confirmation text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
 if uid is null or p_confirmation is distinct from 'DELETE_MY_ACCOUNT' then
  raise exception 'account_deletion_unauthorized' using errcode='42501';
 end if;
 perform 1 from auth.users where id=uid for update;
 if not found then raise exception 'account_not_found' using errcode='42501'; end if;
 -- Remove linked activity, rather than only anonymizing its user_id via the FK.
 if to_regclass('public.analytics_events') is not null then
  execute 'delete from public.analytics_events where user_id = $1' using uid;
 end if;
 if to_regclass('public.drop_plan_drafts') is not null then
  execute 'delete from public.drop_plan_drafts where user_id = $1' using uid;
 end if;
 -- Auth sessions/identities and account tables use ON DELETE CASCADE.
 delete from auth.users where id=uid;
 return jsonb_build_object('deleted',true);
end;
$$;
revoke all on function public.busan_delete_my_account(text) from public, anon;
grant execute on function public.busan_delete_my_account(text) to authenticated;
commit;
