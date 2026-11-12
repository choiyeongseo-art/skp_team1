-- Disposable fixtures only. All changes, including pruning, are rolled back.
begin;
insert into public.analytics_sessions(session_id,visitor_id,secret_hash,environment,started_at,last_seen_at,device_type,language) values
 ('00000000-0000-4000-8000-000000009001','00000000-0000-4000-8000-000000009001','retention-test','test',now()-interval '91 days',now()-interval '91 days','mobile','ko'),
 ('00000000-0000-4000-8000-000000009002','00000000-0000-4000-8000-000000009002','retention-test','test',now()-interval '91 days',now()-interval '91 days','mobile','ko'),
 ('00000000-0000-4000-8000-000000009003','00000000-0000-4000-8000-000000009003','retention-test','test',now()-interval '90 days',now()-interval '90 days','mobile','ko');
insert into public.analytics_events(id,session_id,visitor_id,environment,occurred_at,event_name,auth_method,screen) values
 ('00000000-0000-4000-8000-000000009001','00000000-0000-4000-8000-000000009001','00000000-0000-4000-8000-000000009001','test',now()-interval '91 days','screen_view','guest','home'),
 ('00000000-0000-4000-8000-000000009002','00000000-0000-4000-8000-000000009002','00000000-0000-4000-8000-000000009002','test',now()-interval '1 day','screen_view','guest','home'),
 ('00000000-0000-4000-8000-000000009003','00000000-0000-4000-8000-000000009003','00000000-0000-4000-8000-000000009003','test',now()-interval '90 days','screen_view','guest','home');
insert into public.drop_plan_drafts(draft_id,visitor_id,session_id,environment,started_at,last_activity_at) values
 ('00000000-0000-4000-8000-000000009001','00000000-0000-4000-8000-000000009001','00000000-0000-4000-8000-000000009001','test',now()-interval '91 days',now()-interval '91 days'),
 ('00000000-0000-4000-8000-000000009003','00000000-0000-4000-8000-000000009003','00000000-0000-4000-8000-000000009003','test',now()-interval '90 days',now()-interval '90 days');
do $$
declare before_accounts bigint; before_likes bigint; before_plans bigint;
begin
 select count(*) into before_accounts from auth.users;
 select count(*) into before_likes from public.busan_account_events;
 select count(*) into before_plans from public.busan_account_plans;
 perform public.busan_prune_analytics();
 if exists(select 1 from public.analytics_sessions where session_id='00000000-0000-4000-8000-000000009001') then raise exception 'expired_session_not_pruned'; end if;
 if exists(select 1 from public.analytics_events where id='00000000-0000-4000-8000-000000009001') then raise exception 'expired_event_not_pruned'; end if;
 if exists(select 1 from public.drop_plan_drafts where draft_id='00000000-0000-4000-8000-000000009001') then raise exception 'expired_draft_not_pruned'; end if;
 if not exists(select 1 from public.analytics_sessions where session_id='00000000-0000-4000-8000-000000009002') then raise exception 'referenced_session_pruned'; end if;
 if not exists(select 1 from public.analytics_events where id='00000000-0000-4000-8000-000000009003') then raise exception 'boundary_event_pruned'; end if;
 if not exists(select 1 from public.drop_plan_drafts where draft_id='00000000-0000-4000-8000-000000009003') then raise exception 'boundary_draft_pruned'; end if;
 if (select count(*) from auth.users)<>before_accounts or (select count(*) from public.busan_account_events)<>before_likes or (select count(*) from public.busan_account_plans)<>before_plans then raise exception 'service_records_changed'; end if;
 if has_function_privilege('anon','public.busan_prune_analytics()','execute') or has_function_privilege('authenticated','public.busan_prune_analytics()','execute') then raise exception 'public_execution_enabled'; end if;
end $$;
rollback;
select 'passed: expired rows, exact 90-day boundary, active references, account data isolation, function ACL; all fixtures rolled back' as result;
