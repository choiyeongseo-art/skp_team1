begin;
create table public.analytics_sessions (
 session_id uuid primary key, visitor_id uuid not null, secret_hash text not null,
 environment text not null check(environment in ('production','test','development')),
 started_at timestamptz not null default now(), last_seen_at timestamptz not null default now(),
 device_type text not null check(device_type in ('mobile','tablet','desktop')),
 language text not null check(language in ('ko','en','ja','zh','zh-TW')),
 referrer_host text, utm_source text, utm_medium text, utm_campaign text,
 event_count integer not null default 0 check(event_count between 0 and 5000)
);
create table public.analytics_events (
 id uuid primary key, session_id uuid not null references public.analytics_sessions(session_id),
 visitor_id uuid not null, user_id uuid references auth.users(id) on delete set null,
 environment text not null, occurred_at timestamptz not null, received_at timestamptz not null default now(),
 event_name text not null check(event_name in ('screen_view','guest_entered','login_started','login_code_requested','login_succeeded','login_failed','session_restored','logout_succeeded','event_detail_viewed','event_store_find_clicked','event_store_selected','event_like_clicked','event_like_added','event_like_removed','plan_creation_started','plan_draft_updated','plan_step_completed','plan_saved','plan_cloud_synced','plan_opened','plan_deleted','directions_clicked','stop_marked_visited','stop_visit_unmarked','language_changed','operation_failed')),
 auth_method text not null check(auth_method in ('guest','google','apple','email','unknown')),
 screen text not null check(length(screen)<=40), event_id text check(length(event_id)<=200),
 store_id text check(length(store_id)<=200), plan_id text check(length(plan_id)<=200), draft_id uuid,
 properties jsonb not null default '{}'::jsonb check(octet_length(properties::text)<=2048)
);
create index analytics_events_time on public.analytics_events(environment,occurred_at);
create index analytics_events_funnel on public.analytics_events(session_id,event_name,occurred_at);
create index analytics_events_campaign on public.analytics_events(event_id,event_name,occurred_at);
create index analytics_events_user on public.analytics_events(user_id,occurred_at) where user_id is not null;
create table public.drop_plan_drafts (
 draft_id uuid primary key, visitor_id uuid not null, user_id uuid references auth.users(id) on delete set null,
 session_id uuid not null references public.analytics_sessions(session_id), environment text not null,
 started_at timestamptz not null, last_activity_at timestamptz not null, completed_at timestamptz,
 plan_id text, current_step integer not null default 1, event_count integer not null default 0,
 sight_count integer not null default 0, food_count integer not null default 0, editing_existing boolean not null default false
);
create index drop_plan_drafts_activity on public.drop_plan_drafts(environment,last_activity_at);
alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.drop_plan_drafts enable row level security;
revoke all on public.analytics_sessions,public.analytics_events,public.drop_plan_drafts from public,anon,authenticated;
grant select on public.analytics_sessions,public.analytics_events,public.drop_plan_drafts to service_role;
-- Only this bounded, append-only ingestion function is exposed. It returns counts, never telemetry rows.
create function public.busan_collect_analytics(p_session jsonb,p_events jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare sid uuid; vid uuid; secret text; env text; item jsonb; props jsonb; eid uuid; ts timestamptz;
 uid uuid; method text; inserted integer; accepted integer:=0; step integer; ec integer; sc integer; fc integer;
begin
 if jsonb_typeof(p_session) is distinct from 'object' or jsonb_typeof(p_events) is distinct from 'array' or jsonb_array_length(p_events) not between 1 and 25 or octet_length(p_events::text)>65536 then raise exception 'invalid_batch'; end if;
 sid:=(p_session->>'session_id')::uuid; vid:=(p_session->>'visitor_id')::uuid; secret:=p_session->>'secret'; env:=p_session->>'environment';
 if sid is null or vid is null or secret is null or length(secret) not between 32 and 100 or env not in ('production','test','development') or env is null then raise exception 'invalid_session'; end if;
 insert into public.analytics_sessions(session_id,visitor_id,secret_hash,environment,device_type,language,referrer_host,utm_source,utm_medium,utm_campaign)
 values(sid,vid,md5(secret),env,p_session->>'device_type',p_session->>'language',left(p_session->>'referrer_host',200),left(p_session->>'utm_source',100),left(p_session->>'utm_medium',100),left(p_session->>'utm_campaign',100)) on conflict(session_id) do nothing;
 perform 1 from public.analytics_sessions where session_id=sid and visitor_id=vid and secret_hash=md5(secret) and environment=env for update;
 if not found then raise exception 'session_mismatch'; end if;
 if (select event_count from public.analytics_sessions where session_id=sid)+jsonb_array_length(p_events)>5000 then raise exception 'session_limit'; end if;
 for item in select value from jsonb_array_elements(p_events) loop
  eid:=(item->>'id')::uuid; ts:=(item->>'occurred_at')::timestamptz;
  if ts is null or ts<now()-interval '7 days' or ts>now()+interval '5 minutes' then raise exception 'invalid_timestamp'; end if;
  uid:=case when item->>'authenticated'='true' then auth.uid() else null end;
  if item->>'authenticated'='true' and uid is null then raise exception 'authentication_required'; end if;
  method:=case when uid is null then 'guest' else coalesce(item->>'auth_method','unknown') end;
  select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into props from jsonb_each(coalesce(item->'properties','{}'::jsonb)) where key in ('step','venue_index','event_count','sight_count','food_count','editing_existing','save_scope','operation','error_code','skipped','source','language','wanted_saved');
  insert into public.analytics_events(id,session_id,visitor_id,user_id,environment,occurred_at,event_name,auth_method,screen,event_id,store_id,plan_id,draft_id,properties)
  values(eid,sid,vid,uid,env,ts,item->>'event_name',method,coalesce(item->>'screen','unknown'),nullif(item->>'event_id',''),nullif(item->>'store_id',''),nullif(item->>'plan_id',''),nullif(item->>'draft_id','')::uuid,props) on conflict(id) do nothing;
  get diagnostics inserted=row_count; accepted:=accepted+inserted;
  if inserted=1 and item->>'event_name' in ('plan_creation_started','plan_draft_updated','plan_saved') and nullif(item->>'draft_id','') is not null then
   step:=least(5,greatest(1,coalesce((props->>'step')::integer,1))); ec:=least(100,greatest(0,coalesce((props->>'event_count')::integer,0))); sc:=least(1000,greatest(0,coalesce((props->>'sight_count')::integer,0))); fc:=least(1000,greatest(0,coalesce((props->>'food_count')::integer,0)));
   insert into public.drop_plan_drafts(draft_id,visitor_id,user_id,session_id,environment,started_at,last_activity_at,completed_at,plan_id,current_step,event_count,sight_count,food_count,editing_existing)
   values((item->>'draft_id')::uuid,vid,uid,sid,env,ts,ts,case when item->>'event_name'='plan_saved' then ts end,item->>'plan_id',step,ec,sc,fc,coalesce((props->>'editing_existing')::boolean,false))
   on conflict(draft_id) do update set user_id=coalesce(excluded.user_id,public.drop_plan_drafts.user_id),started_at=least(public.drop_plan_drafts.started_at,excluded.started_at),last_activity_at=greatest(public.drop_plan_drafts.last_activity_at,excluded.last_activity_at),completed_at=coalesce(public.drop_plan_drafts.completed_at,excluded.completed_at),plan_id=coalesce(excluded.plan_id,public.drop_plan_drafts.plan_id),current_step=case when excluded.last_activity_at>=public.drop_plan_drafts.last_activity_at then excluded.current_step else public.drop_plan_drafts.current_step end,event_count=case when excluded.last_activity_at>=public.drop_plan_drafts.last_activity_at then excluded.event_count else public.drop_plan_drafts.event_count end,sight_count=case when excluded.last_activity_at>=public.drop_plan_drafts.last_activity_at then excluded.sight_count else public.drop_plan_drafts.sight_count end,food_count=case when excluded.last_activity_at>=public.drop_plan_drafts.last_activity_at then excluded.food_count else public.drop_plan_drafts.food_count end
   where public.drop_plan_drafts.visitor_id=vid and public.drop_plan_drafts.environment=env and (public.drop_plan_drafts.user_id is null or public.drop_plan_drafts.user_id=uid);
  end if;
 end loop;
 update public.analytics_sessions set last_seen_at=now(),event_count=event_count+accepted where session_id=sid;
 return jsonb_build_object('accepted',accepted);
end; $$;
revoke all on function public.busan_collect_analytics(jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.busan_collect_analytics(jsonb,jsonb) to anon,authenticated;
create view public.analytics_daily_actions as
 select (occurred_at at time zone 'Asia/Seoul')::date as day,event_name,auth_method,screen,event_id,
 count(*) as action_count,count(distinct visitor_id) as browser_visitors,count(distinct user_id) as logged_in_accounts,count(distinct session_id) as sessions
 from public.analytics_events where environment='production' group by 1,2,3,4,5;
create view public.analytics_daily_funnel as
 with journey as (select session_id,min(occurred_at) as first_at,
 min(occurred_at) filter(where event_name='screen_view' and screen='signup') as login_at,
 min(occurred_at) filter(where event_name='screen_view' and screen='home') as home_at,
 bool_or(event_name='guest_entered') as guest,bool_or(event_name='login_succeeded') as login_success,
 bool_or(event_name='session_restored') as restored,bool_or(event_name='plan_creation_started' and coalesce((properties->>'editing_existing')::boolean,false)=false) as plan_started,
 bool_or(event_name='plan_saved') as plan_saved,bool_or(event_name='directions_clicked') as directions
 from public.analytics_events where environment='production' group by session_id)
 select (first_at at time zone 'Asia/Seoul')::date as day,count(*) as sessions,
 count(*) filter(where login_at is not null) as login_screen_sessions,
 count(*) filter(where home_at is not null) as home_sessions,
 count(*) filter(where home_at>=login_at) as login_to_home_sessions,
 count(*) filter(where guest) as guest_entry_sessions,count(*) filter(where login_success) as login_success_sessions,
 count(*) filter(where restored) as restored_sessions,count(*) filter(where plan_started) as plan_start_sessions,
 count(*) filter(where plan_saved) as plan_saved_sessions,count(*) filter(where directions) as directions_sessions
 from journey group by 1;
create view public.analytics_event_conversion as
 with campaign as (select session_id,visitor_id,event_id,min(occurred_at) filter(where event_name='event_store_find_clicked') as find_at,
 max(occurred_at) filter(where event_name='event_like_added') as liked_at from public.analytics_events where environment='production' and event_id is not null group by 1,2,3)
 select event_id,count(*) filter(where find_at is not null) as store_find_sessions,
 count(*) filter(where liked_at>=find_at) as find_then_like_sessions,
 count(distinct visitor_id) filter(where find_at is not null) as store_find_browsers,
 count(distinct visitor_id) filter(where liked_at>=find_at) as find_then_like_browsers
 from campaign group by event_id;
create view public.analytics_plan_status as
 select *,case when completed_at is not null then 'completed' when last_activity_at<now()-interval '24 hours' then 'inactive_24h' else 'in_progress' end as status,
 extract(epoch from (completed_at-started_at)) as completion_seconds from public.drop_plan_drafts where environment='production';
create view public.analytics_current_likes as
 with latest as (select distinct on(visitor_id,event_id) visitor_id,event_id,event_name from public.analytics_events where environment='production' and event_name in ('event_like_added','event_like_removed') order by visitor_id,event_id,occurred_at desc,received_at desc),
 observed as (select event_id,count(*) filter(where event_name='event_like_added') as likes from latest group by event_id),
 accounts as (select event_id,count(*) as likes from public.busan_account_events group by event_id)
 select coalesce(o.event_id,a.event_id) as event_id,coalesce(o.likes,0) as observed_browser_likes,coalesce(a.likes,0) as current_account_likes from observed o full join accounts a using(event_id);
revoke all on public.analytics_daily_actions,public.analytics_daily_funnel,public.analytics_event_conversion,public.analytics_plan_status,public.analytics_current_likes from public,anon,authenticated;
grant select on public.analytics_daily_actions,public.analytics_daily_funnel,public.analytics_event_conversion,public.analytics_plan_status,public.analytics_current_likes to service_role;
create view public.analytics_login_methods as
 select (occurred_at at time zone 'Asia/Seoul')::date as day,
 case when event_name='guest_entered' then 'guest' when properties->>'source' in ('google','apple','email') then properties->>'source' else auth_method end as method,
 count(*) filter(where event_name='login_started') as attempts,
 count(*) filter(where event_name='login_succeeded') as successes,
 count(*) filter(where event_name='login_failed') as failures,
 count(*) filter(where event_name='session_restored') as restored,
 count(*) filter(where event_name='guest_entered') as guest_entries,
 count(distinct visitor_id) as browser_visitors
 from public.analytics_events where environment='production' and event_name in ('login_started','login_succeeded','login_failed','session_restored','guest_entered') group by 1,2;
create view public.analytics_retention as
 with activity as (select distinct visitor_id,(occurred_at at time zone 'Asia/Seoul')::date as day from public.analytics_events where environment='production'),
 cohorts as (select visitor_id,min(day) as first_day from activity group by visitor_id)
 select c.first_day,count(*) as cohort_browsers,
 count(*) filter(where exists(select 1 from activity a where a.visitor_id=c.visitor_id and a.day=c.first_day+1)) as day1_returned,
 count(*) filter(where exists(select 1 from activity a where a.visitor_id=c.visitor_id and a.day=c.first_day+7)) as day7_returned,
 c.first_day+1<(now() at time zone 'Asia/Seoul')::date as day1_complete,
 c.first_day+7<(now() at time zone 'Asia/Seoul')::date as day7_complete
 from cohorts c group by c.first_day;
revoke all on public.analytics_login_methods,public.analytics_retention from public,anon,authenticated;
grant select on public.analytics_login_methods,public.analytics_retention to service_role;
commit;
