begin;
create extension if not exists pg_cron;
-- Service data (accounts/likes/plans) is deliberately outside this retention job.
create or replace function public.busan_prune_analytics()
returns jsonb language plpgsql set search_path = '' as $$
declare cutoff timestamptz := now() - interval '90 days';
 events_deleted bigint; drafts_deleted bigint; sessions_deleted bigint;
begin
 if not pg_try_advisory_xact_lock(20261110,90) then
  return jsonb_build_object('skipped',true);
 end if;
 delete from public.analytics_events where occurred_at < cutoff;
 get diagnostics events_deleted = row_count;
 delete from public.drop_plan_drafts where last_activity_at < cutoff;
 get diagnostics drafts_deleted = row_count;
 -- Respect FK references and preserve sessions that still have recent activity.
 delete from public.analytics_sessions s where s.last_seen_at < cutoff
  and not exists(select 1 from public.analytics_events e where e.session_id=s.session_id)
  and not exists(select 1 from public.drop_plan_drafts d where d.session_id=s.session_id);
 get diagnostics sessions_deleted = row_count;
 return jsonb_build_object('events',events_deleted,'drafts',drafts_deleted,'sessions',sessions_deleted,'cutoff',cutoff);
end;
$$;
revoke all on function public.busan_prune_analytics() from public,anon,authenticated,service_role;
-- Daily 19:00 UTC = 04:00 Asia/Seoul. Function owner is the SQL operator (postgres).
select cron.schedule('busandrop-analytics-retention-90d','0 19 * * *','select public.busan_prune_analytics();');
commit;
-- Register only: no immediate purge is executed by this migration.
