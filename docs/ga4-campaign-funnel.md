# BUSAN DROP 유입과 플랜 퍼널

## 홍보 링크

| 담당 채널 | 링크 |
|---|---|
| 샤오홍슈 | [프로필](https://busandrop.vercel.app/busandrop/login?utm_source=xiaohongshu&utm_medium=social&utm_campaign=launch&utm_content=xhs01_bio) |
| 인스타그램 1 | [프로필](https://busandrop.vercel.app/busandrop/login?utm_source=instagram&utm_medium=social&utm_campaign=launch&utm_content=ig01_bio) |
| 인스타그램 2 | [프로필](https://busandrop.vercel.app/busandrop/login?utm_source=instagram&utm_medium=social&utm_campaign=launch&utm_content=ig02_bio) |
| 유튜브 1 | [영상 01 설명란](https://busandrop.vercel.app/busandrop/login?utm_source=youtube&utm_medium=social&utm_campaign=launch&utm_content=yt01_video01_description) |
| 유튜브 2 | [영상 01 설명란](https://busandrop.vercel.app/busandrop/login?utm_source=youtube&utm_medium=social&utm_campaign=launch&utm_content=yt02_video01_description) |

영상마다 클릭 가능한 링크를 따로 제공하면 utm_content의 영상 번호를 바꾼다. 공유 프로필 링크 하나로는 영상별 집계가 불가능하다. 게시 전에 플랫폼 앱에서 직접 링크를 열어 매개변수 유지 여부를 확인한다.

## 보고서 만들기

GA4 → 탐색 → 자유 형식. 행에는 세션 소스, 세션 수동 광고 콘텐츠, 국가를 추가한다. 행동 비교에는 이벤트 이름과 이벤트 수 또는 총 사용자를 추가한다. 세션 수는 이벤트 이름 필터를 빼고 확인한다. 국가는 접속 추정치다.

GA4 → 탐색 → 유입경로 탐색. 로그인 또는 홈 방문에서 플랜 저장까지 확인하려면 다음을 순서대로 추가하고 각 단계는 간접적으로 이어짐으로 설정한다. 캠페인 비교는 세션 소스·세션 수동 광고 콘텐츠 조건을 담은 세션 세그먼트로 구성하고, 분류에는 국가를 선택한다.

1. 유입 — page_view
2. 행사 선택 화면 — plan_view_events
3. 주변 관광지 — plan_view_sights
4. 주변 맛집 — plan_view_food
5. 플랜 확인 — plan_view_review
6. 기기에 완료 플랜 저장 — plan_saved

행사 조회와 저장은 별도 퍼널(page_view → event_detail_viewed → event_like_added)로 확인한다. 플랜 만들기에 행사 저장은 필수 단계가 아니다. 다음 단계에 진입한 건너뛰기는 이탈로 분류되지 않는다. 여러 행사장의 관광지·맛집 진입 이벤트가 반복될 수 있고, 이 퍼널은 장소별 전체 순회 성공을 뜻하지 않는다. plan_cloud_synced는 로그인 계정 서버 동기화 성공이다. 플랜 시작 지표는 새 초안 최초 생성 시의 plan_creation_started로 본다.

## 데이터 경계

2026-11-16 UTM 전송 수정: 초기 config에만 캠페인을 전달하면 실제 collect 요청에서 캠페인이 누락되는 현상을 재현했다. 태그 로드 전 set으로 캠페인과 자동 페이지뷰 설정을 적용하고, 수동 page_view 및 제품 이벤트에도 캠페인을 명시한다. 최초 URL에서 허용한 UTM 네 값만 캡처하여 화면 전환 뒤에도 유지한다. 운영 배포 dpl_HYBku73GTBCrTJJ4jzTMn6pcVHkX에서 새 Chrome 프로필로 instagram/ig02_bio 및 youtube/yt02_bio를 각각 접속해 첫 페이지뷰와 행사 상세 조회의 cs/cm/cn/cc 및 HTTP 204를 확인했다. 증거는 ga4-utm-transport-verified-20261116.json에 보관한다. 보고서 귀속 결과와 어드민 조회 인증은 별도 확인 대상이다. 실제 속성의 향상된 측정에서 scroll 및 추가 page_view가 발생하는 것도 관찰했으며 이번에 속성 설정을 변경하지 않았다.

Supabase의 analytics_sessions, analytics_events, drop_plan_drafts는 자체 이용 지표 원본이다. GA4는 같은 동작의 제한된 이벤트만 별도 동의 후 받는다. 이메일, 계정·플랜·초안 ID, 주소 및 좌표를 GA4 이벤트로 보내지 않는다. 소급 귀속과 앱 마켓 설치 귀속은 적용되지 않는다. GA4 속성에서 향상된 측정을 끄고 Google의 수신을 확인한다.

API로 유입·행동 건수를 내려받으려면 BUSANDROP_GA4_PROPERTY_ID와 BUSANDROP_GA4_ACCESS_TOKEN(analytics.readonly)을 설정한 뒤 node scripts/ga4-report.cjs YYYY-MM-DD YYYY-MM-DD를 실행한다. 이 데이터는 순차 퍼널이나 사용자별 행동 원본이 아니다. GA4에서 표본 제한 표시가 나오면 결과 해석 시 확인한다.
