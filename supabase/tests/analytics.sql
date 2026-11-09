-- Disposable synthetic data: the transaction is rolled back; no production user rows are touched.
begin;
set local role anon;
do $$
declare s jsonb:='{"session_id":"a1111111-1111-4111-8111-111111111111","visitor_id":"b1111111-1111-4111-8111-111111111111","secret":"12345678-1234-4234-8234-123456789012","environment":"test","device_type":"mobile","language":"ko"}';
 events jsonb; result jsonb;
begin
 events:=jsonb_build_array(jsonb_build_object('id','c1111111-1111-4111-8111-111111111111','occurred_at',now(),'event_name','plan_creation_started','screen','pass','draft_id','d1111111-1111-4111-8111-111111111111','authenticated',false,'properties',jsonb_build_object('step',1,'email','do-not-store@example.com')),jsonb_build_object('id','c2222222-2222-4222-8222-222222222222','occurred_at',now(),'event_name','event_like_added','event_id','sql-test-event','screen','home','authenticated',false));
 result:=public.busan_collect_analytics(s,events);if (result->>'accepted')::integer<>2 then raise exception 'guest_ingest_failed'; end if;
 result:=public.busan_collect_analytics(s,events);if (result->>'accepted')::integer<>0 then raise exception 'deduplication_failed'; end if;
 result:=public.busan_collect_analytics(s,jsonb_build_array(jsonb_build_object('id','c3333333-3333-4333-8333-333333333333','occurred_at',now(),'event_name','plan_saved','screen','pass','draft_id','d1111111-1111-4111-8111-111111111111','plan_id','sql-test-plan','authenticated',false,'properties',jsonb_build_object('step',5,'event_count',2,'save_scope','browser'))));
 if (result->>'accepted')::integer<>1 then raise exception 'completion_ingest_failed'; end if;
 begin perform count(*) from public.analytics_events;raise exception 'anonymous_read_was_allowed';exception when insufficient_privilege then null;end;
 begin perform public.busan_collect_analytics(s||'{"secret":"00000000-0000-4000-8000-000000000000"}',events);raise exception 'session_mismatch_not_blocked';exception when others then if sqlerrm<>'session_mismatch' then raise;end if;end;
 begin perform public.busan_collect_analytics(s,jsonb_build_array(jsonb_build_object('id','c4444444-4444-4444-8444-444444444444','occurred_at',now(),'event_name','login_succeeded','screen','signup','authenticated',true,'auth_method','email')));raise exception 'identity_spoof_not_blocked';exception when others then if sqlerrm<>'authentication_required' then raise;end if;end;
end $$;
reset role;
do $$ begin
 if (select count(*) from public.analytics_events where session_id='a1111111-1111-4111-8111-111111111111')<>3 then raise exception 'event_total_failed';end if;
 if exists(select 1 from public.analytics_events where session_id='a1111111-1111-4111-8111-111111111111' and (user_id is not null or properties ? 'email')) then raise exception 'privacy_or_identity_failed';end if;
 if not exists(select 1 from public.drop_plan_drafts where draft_id='d1111111-1111-4111-8111-111111111111' and completed_at is not null and plan_id='sql-test-plan' and current_step=5 and event_count=2) then raise exception 'draft_linkage_failed';end if;
 if exists(select 1 from public.analytics_daily_actions where event_id='sql-test-event') then raise exception 'test_traffic_pollution';end if;
 if exists(select 1 from public.analytics_plan_status where draft_id='d1111111-1111-4111-8111-111111111111') then raise exception 'test_plan_pollution';end if;
 if has_table_privilege('authenticated','public.analytics_events','select') or has_table_privilege('anon','public.analytics_daily_funnel','select') then raise exception 'telemetry_read_permissions_failed';end if;
end $$;
rollback;
select 'PASS: guest ingestion, replay deduplication, draft completion, read denial, session secret, identity spoof rejection, field filtering, test exclusion and role grants' as analytics_database_tests;
