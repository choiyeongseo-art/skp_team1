# BUSANDROP 서비스 지표 DB

구현일: 2026-11-09. 프로젝트: `yinxfrdkxohyttmkuaxa`.

## 저장 구조

기존 계정 기능 테이블 3개는 유지한다. 다음 분석 테이블 3개와 운영자 집계 뷰 7개를 추가했다.

| 객체 | 역할 |
|---|---|
| analytics_sessions | 브라우저 방문 세션, 유입 사이트 호스트·캠페인 태그, 기기 종류·언어 |
| analytics_events | 화면·로그인·게스트 진입·행사·좋아요·플랜·길찾기·방문 표시·오류 행동 |
| drop_plan_drafts | 초안 ID, 단계, 행사장·관광지·맛집 수, 시작·활동·완료 시각, 완성 플랜 ID |
| analytics_daily_actions | 한국 시간 일별 행동 횟수·브라우저 방문자·로그인 계정·세션 수 |
| analytics_daily_funnel | 세션 시작일 기준 로그인 화면→홈 도달 및 게스트 진입·플랜 시작/저장 세션 |
| analytics_event_conversion | 같은 세션·같은 행사에서 매장 찾기 후 좋아요 저장 성공으로 이어진 수(전체 기간) |
| analytics_plan_status | 작성 중 / 24시간 비활성 / 저장 완료, 완료 소요 시간 |
| analytics_current_likes | 수집 이후 관측한 브라우저별 현재 좋아요 수와 기존 계정 테이블의 현재 좋아요 수를 별도 제공 |
| analytics_login_methods | Google·Apple·이메일별 시도/성공/실패/세션 복원, 게스트 둘러보기 진입 |
| analytics_retention | 최초 관측일 코호트별 D1·D7 재방문 브라우저 수 및 관측 기간 완료 여부 |

분석 초안은 집계용 요약이며 전체 초안의 서버 복원 기능이 아니다. 제목·주소·좌표·이메일·토큰·인증코드를 분석 기록에 넣지 않는다.

## 이벤트 정의

| 이벤트 | 기록 시점 |
|---|---|
| screen_view | 화면이 표시될 때. 동일 화면의 단순 재렌더는 제외 |
| guest_entered | 로그인 화면의 먼저 둘러보기 버튼 클릭 |
| login_started | Google·Apple 버튼 클릭 또는 이메일 인증 요청 시작 |
| login_code_requested | 이메일 인증메일 요청 API 성공(메일 도착 보장 아님) |
| login_succeeded | 새 인증 성공이 서버 사용자 검증으로 확인됨 |
| login_failed | 인증 시도 실패. 오류 원문·이메일은 제외하고 정해진 코드만 기록 |
| session_restored | 기존 유효 세션을 복원. 새 로그인 성공률에 섞지 않음 |
| logout_succeeded | 인증 상태가 로그인에서 로그아웃으로 바뀜 |
| event_detail_viewed | 유효한 행사 상세가 실제 열림 |
| event_store_find_clicked | 홈 배너 등 행사에서 매장 찾기 버튼 클릭 |
| event_store_selected | 매장 목록/지도에서 특정 지점 상세를 선택 |
| event_like_clicked | 좋아요/취소 버튼 클릭 시점. 원하는 상태와 화면/상세 출처 기록 |
| event_like_added / event_like_removed | 서버 저장/취소 성공. 계정 저장은 대기열 전송 성공 후 기록 |
| plan_creation_started | 새 플랜 버튼 또는 작성 단계에서 실제 편집 시작. 기존 플랜 편집은 별도 flag |
| plan_draft_updated | 작성 상태 변경을 0.7초 묶음으로 요약 전송 |
| plan_step_completed | 행사 선택/행사장별 관광지/맛집 단계에서 다음 또는 건너뛰기 성공 |
| plan_saved | 완성한 플랜이 브라우저 기능 저장소에 저장됨. 게스트와 로그인 이용자 모두 집계 |
| plan_cloud_synced | 로그인 계정의 플랜이 Supabase 계정 테이블에 저장 성공 |
| plan_opened | 마이에서 저장한 플랜 열기 |
| plan_deleted | 게스트는 기능 저장소 삭제 성공, 계정은 서버 삭제 성공 |
| directions_clicked | 외부 지도 길찾기 링크 클릭. 실제 이동이나 도착을 의미하지 않음 |
| stop_marked_visited / stop_visit_unmarked | 기능 저장소의 방문 완료 표시/취소 성공. 실제 현장 방문 검증 아님 |
| language_changed | 언어 설정 확정 |
| operation_failed | 행사 좋아요/계정 동기화 등 주요 요청 실패 |

## 집계 기준

- 서비스 이용 통계를 **허용한 방문자만** 분석 대상이다. 처음 선택 전/거부 시 분석 방문자 ID 생성·전송을 하지 않는다. 마이→서비스 이용 통계에서 변경 가능하다. 기능성 계정 저장은 통계 허용 여부와 무관하다.
- 운영 지표는 `environment='production'`만 포함한다. localhost는 development, 미리보기 배포는 test, 운영 URL의 `?analytics_test=1`도 test다.
- 브라우저 방문자 ID는 임의 UUID다. 전체 고유 이용자는 `visitor_id` 기준으로 해석한다. 로그인 계정 수는 `user_id` distinct로 따로 본다. 다른 기기/브라우저의 게스트는 동일인인지 알 수 없다.
- 동일 브라우저에서 게스트→로그인은 같은 방문 흐름으로 볼 수 있다. 로그인 전 이벤트의 user_id는 계속 NULL이며, 세션·방문자 ID로 이어서 분석한다.
- 로그인 방식은 Google·Apple·email. 먼저 둘러보기는 guest다. 자동 세션 복원은 신규 로그인과 구분한다.
- 세션은 탭의 sessionStorage에서 유지하며 30분 무활동 후 새 세션으로 나눈다. 새 탭은 새 세션이다. 일별 퍼널은 세션의 첫 이벤트가 속한 한국 날짜로 귀속한다.
- `plan_saved`는 작성 완료, `plan_cloud_synced`는 계정 서버 보관 성공이다. 여행 완료/실제 방문과 다르다. 서버 보관 성공률은 cloud_synced 기준으로 확인한다.
- `analytics_plan_status`에서 기존 플랜 수정(`editing_existing=true`)을 제외해야 신규 작성 완료율을 계산할 수 있다. 초안 재개 가능성이 있으므로 24시간 비활성은 영구 포기로 단정하지 않는다.
- 좋아요의 브라우저 관측값과 계정 테이블 현재값은 중복될 수 있으므로 **합산하지 않는다**. 배포 전 게스트 행동 이력은 소급 복원하지 않는다. 기존 계정 좋아요는 현재 상태 집계에 포함된다.
- 별도 그룹(언어·화면·로그인 방식)의 distinct 방문자 수를 단순 합산하면 중복될 수 있다.
- 이 수집은 클라이언트 행동 통계다. 봇·조작 방지, GPS 방문 검증, 정확한 사람 수 측정을 보장하지 않는다.
- 재전송은 이벤트 UUID로 중복 제거한다. 최대 25개씩 전송, 브라우저 대기열 최대 1,000개, 6일 초과 기록 제외, 5초 주기/온라인 복귀 재시도. 강제 종료·저장소 차단·동시 탭·오프라인 장기화로 일부 누락될 수 있다.
- 일별 활동·재방문은 데이터 수집 시작 이후 관측값이다. D1/D7 기간이 끝나지 않은 코호트는 완료 플래그가 false다. 목표 전환율은 아직 설정하지 않았다.

## Supabase에서 바로 조회하기

SQL Editor에서 실행한다. 방문자에게 이 뷰들을 공개하는 API는 제공하지 않는다.

```sql
-- 로그인 화면에서 홈까지 도달한 세션 비율
select *, round(100.0*login_to_home_sessions/nullif(login_screen_sessions,0),1) as login_to_home_pct
from public.analytics_daily_funnel order by day desc;

-- Google / Apple / 이메일 / 먼저 둘러보기 구분
select * from public.analytics_login_methods order by day desc,method;

-- 행사별 매장 찾기 → 좋아요 저장 성공
select *,round(100.0*find_then_like_sessions/nullif(store_find_sessions,0),1) as find_to_like_pct
from public.analytics_event_conversion order by store_find_sessions desc;

-- 신규 초안 현재 상태
select status,count(*) as drafts
from public.analytics_plan_status where not editing_existing group by status;

-- 신규 초안 작성 완료율
select count(*) as started_drafts,count(*) filter(where completed_at is not null) as completed_drafts,
 round(100.0*count(*) filter(where completed_at is not null)/nullif(count(*),0),1) as completion_pct
from public.analytics_plan_status where not editing_existing;

-- 행사별 현재 좋아요 (두 열은 합산하지 않음)
select * from public.analytics_current_likes order by current_account_likes desc,observed_browser_likes desc;

-- D1·D7 재방문
select * from public.analytics_retention order by first_day desc;

-- 최근 행동 건수
select day,event_name,sum(action_count) as actions
from public.analytics_daily_actions group by day,event_name order by day desc,actions desc;
```

## 권한·운영

분석 테이블은 RLS를 켜고 anon/authenticated의 직접 CRUD를 막는다. 단일 수집 함수 `busan_collect_analytics(jsonb,jsonb)`만 실행할 수 있다. 함수는 서버의 `auth.uid()`로 계정을 확인하고 세션 비밀값·배치 크기·이벤트 이름·시각·필드·길이를 검증한다. 임의 SQL 실행이나 기록 조회 기능은 없다. 집계 뷰는 운영자/서버 전용이다.

분석용 브라우저 세션 비밀값은 다른 방문 세션 기록에 쓰는 것을 제한하는 임의값이며 인증 토큰이 아니다. 서버에는 해시만 저장한다. 서버 키를 프런트엔드에 추가하지 않았다.

서버 보유 기간/삭제 운영/광고 목적 전환은 별도 확정 사항이다. 자동 삭제 스케줄과 분석 대시보드 UI는 이 작업에 포함하지 않았다.

참고: Supabase 공식 Database Functions 문서의 함수 권한·고정 search_path 방식 적용.
https://supabase.com/docs/guides/database/functions

파일: `supabase/migrations/20261109_product_analytics.sql`, `supabase/tests/analytics.sql`, `tests/analytics.test.cjs`.
