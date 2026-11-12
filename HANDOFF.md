# BUSAN DROP 디자이너 인수인계

기준일: 2026-11-12. 현재 작업을 이어받는 사람을 위한 문서입니다. 오래된 변경 이력은 `docs/archive/HANDOFF_HISTORY_through_20261109.md`에 보관했습니다.

## 1. 현재 기준과 실행

- 저장소: https://github.com/choiyeongseo-art/skp_team1 / 기본 브랜치 main
- 운영: https://busandrop.vercel.app
- 이 전달본은 Git 기준입니다. 운영 사이트와 화면 비교는 로컬 프리뷰에서 진행하세요.
- Node.js 24.x / Express / HTML·CSS·일반 JavaScript. React·Next.js 프로젝트가 아닙니다.
- `npm ci` → `npm run dev`: 4187 포트의 개발 스튜디오.
- `npm run preview`: 4188 포트의 운영 앱 레이아웃. 디자인 최종 확인은 이 화면으로 합니다.
- 원본 `busan-drop/` → `scripts/build.cjs` → 생성물 `public/busandrop/`. 생성물은 커밋하지 않습니다.
- 서버 키는 `.env.local`, 운영 키는 기존 Vercel 프로젝트에서 관리합니다. 프로젝트/키를 새로 만들거나 덮어쓸 필요가 없습니다. 별도 권한 없이 운영 DB 설정을 변경하지 마세요.

## 2. 구현된 주요 기능

- 홈: 행사 배너·로컬/팝업 탐색, 행사 기간·지점·카테고리 기반 조회.
- 행사: 공식 확인 정보와 미확인 조건 구분, 지점별 상세·운영시간·외부 길찾기·좋아요.
- 매장 찾기: 지역·카테고리·브랜드 필터, 목록/지도, 중복 좌표 지점 선택.
- 드롭 플랜: 여행 기간 → 행사·지점 → 행사장별 관광지 → 맛집 → 검토·저장.
- 마이: MY PAGE 제목 → 내 드롭 플랜 → 여행 안내 카드 → 플랜 카드 → 설정.
- 설정: 언어 설정·서비스 안내·서비스 이용 통계·로그인 시 로그아웃을 각각 독립 버튼으로 배치.
- 저장: 좋아요한 행사 목록과 저장 행사로 플랜 만들기.
- 플랜 상세: 다음 목적지, 전체 방문 순서, 행사/장소 위아래 이동, 장소 삭제, 방문 완료/취소·스탬프.
- 순서 이동 시 **누른 카드**가 이동 후 중앙에 보이도록 보정. 긴 행사 묶음은 행사 제목을 중심에 둡니다. 애니메이션 560ms, 모션 줄이기 설정 지원.
- 장소 카드: 주소 아래 운영시간. 요일·계절별 복수 시간은 줄 분리, 주의 문구는 별도로 표시.
- 마이의 회원탈퇴 UI와 웹 지원·개인정보·이용약관 페이지를 포함합니다. 탈퇴는 되돌릴 수 없으므로 디자인 검증은 테스트 계정으로 진행하세요.
- 언어: 한국어·영어·일본어·중국어 간체/번체. Next stop의 장소명·주소도 장소 사전을 사용합니다.
- 로그인: Google·Apple, 아이디·비밀번호 로그인, 회원가입, 먼저 둘러보기. 유효한 세션은 검증 후 복원.
- 계정 데이터: 좋아요 행사·완성한 플랜·방문 상태·마지막 언어를 저장. 계정 캐시/대기열/작성 중 초안을 분리하고 통신 실패 시 재시도.
- 지표: 통계 수집 허용 후에만 세션·행동·생성 중 플랜 요약을 전송. 개발/테스트 기록은 운영 집계에서 제외.

## 3. 디자인 수정 파일 지도

| 대상 | 주요 파일 |
|---|---|
| 화면 뼈대·공통 요소 | `busan-drop/index.html`, `app.js`, `style.css` |
| 공통 컬러·하단 탭 그라데이션 | `integration/light-theme.css`, `integration/navigation-spacing.css` |
| 로그인 화면 | `integration/login.js`, `integration/login.css` |
| 홈 배너·탐색 | `integration/supplied-banners.js`, `supplied-banners.css`, `home-discovery.js`, `home-discovery.css`, `home-categories.js` |
| 행사 상세 시트 | `integration/event-detail-popup.js`, `event-detail-popup.css` |
| 행사 목록/지도 | `integration/store-mapbox.js`, `store-mapbox.css`, `mapbox-view.js`, `map-appearance.css` |
| 드롭 플랜 편집 | `integration/shopping-pass.js`, `shopping-pass.css` |
| 마이·플랜 상세·스탬프 | `integration/my-library.js`, `my-library.css`, `my-library-model.js` |
| 장소 카드·관광 다국어 | `integration/place-card.js`, `place-card.css`, `tourism-i18n.js` |
| 5개 언어 문구 | `language.js`, `data/i18n-overrides.json`, `data/i18n-overrides.js`, `integration/i18n.js` |
| 행사·장소 데이터 | `data/event-catalog.js`, `event-details.js`, `store-locations.js`, `nearby-places.js` |
| 로고·이미지·폰트 | `assets/`, `thumbnail-assets.js` |
| 운영 폭·높이·safe area | **`scripts/production-shell.cjs`**: 운영용 CSS/JS를 빌드 시 생성 |
| 회원탈퇴·지원/약관 | `integration/account-deletion.js`, `data/legal-documents.js`, `scripts/build-service-pages.cjs` |
| 계정·인증 연결 | `integration/auth-client.js`, `account-store.js` |
| 통계 선택/수집 | `integration/analytics.js` |

표의 integration 경로는 `busan-drop/` 아래입니다. 화면 파일 일부는 한 줄로 압축된 형태입니다. 전체 파일 포맷 변경을 섞으면 검토가 어려우므로 수정 범위 중심으로 작업하세요.

## 4. 디자인 마무리 시 유지할 동작

- 하단 탭의 선택 상태는 원형 테두리 대신 부드러운 노란 그라데이션 영역입니다.
- 여행 안내 카드는 항상 펼쳐져 있으며, 길찾기 → 방문 완료 → 다음 목적지의 세 단계를 설명합니다.
- 플랜 카드의 기능 버튼, `data-*` 속성, 화면 컨테이너 ID, 스크립트 순서를 유지하세요. 이벤트 연결과 지도 수명주기가 이를 사용합니다.
- 레이아웃 변경 후 하단 탭/고정 행동 버튼이 본문을 덮지 않는지, 본문 스크롤의 마지막 항목까지 도달하는지 확인하세요.
- 지도 좌표와 외부 길찾기 원본 값은 번역하지 않습니다. 화면 표시 이름·주소만 다국어 사전으로 변환합니다.
- 스타일 뒤에 로드되는 `integration/*.css`가 `style.css`를 덮어쓸 수 있습니다. 운영 전용 shell은 마지막에 적용됩니다.
- 정적 번역을 수정하면 JSON과 같은 내용의 JS 등록 파일을 함께 갱신하고 index.html의 관련 `?v=` 버전을 올립니다.
- `busan-drop/index.html`은 개발 스튜디오 원본입니다. 운영에서는 빌드가 사이드바·모의 상태바·기기 테두리를 숨깁니다.

## 5. 남은 점검과 실제 검증 범위

1. **iPad Chrome의 높이/표시 영역 문제는 미해결 상태로 보류했습니다.** iPhone에서 문제 없다는 사용자 피드백과 데스크톱 브라우저 치수 검증은 있지만, 같은 iPad에서 재현·해결을 확인한 것은 아닙니다. `?layout_debug=1`로 visualViewport·앱·탭바 치수를 확인할 수 있습니다.
2. 운영 레이아웃은 390×844 고정 축소가 아닙니다. 폭 430px 이하에서는 기기 폭 100%, 그 이상에서는 최대 430px의 모바일 열을 중앙 배치하고 실제 표시 높이를 따릅니다. source studio의 390×844 설명과 구분하세요.
3. Google 로그인은 앞선 로컬 사용자 검증이 있었으나 이번 전달에서 Google·Apple·아이디 로그인과 회원탈퇴의 운영 환경 종단 검증을 다시 수행하지 않았습니다. 실제 인증에는 담당자가 관리하는 설정이 필요합니다.
4. 계정 저장과 재시도·격리는 자동 테스트로 검증했습니다. 실제 계정으로 여러 기기 간 저장/복원하는 종단 검증은 별도입니다.
5. 실제 브라우저에서 지표 테스트 11건(게스트 진입·화면·매장 찾기·상세·플랜 시작 등)의 Supabase 수신을 확인했습니다. 이는 test 환경 기록이며 실제 이용자 성과 수치가 아닙니다.
6. 분석 초안은 단계·선택 수 등 요약 데이터입니다. 모든 작성 중 초안 내용을 다른 기기에서 복원하는 기능은 아닙니다. 동일 플랜의 동시 편집은 마지막 서버 쓰기 기준이며 공동 편집/충돌 병합은 없습니다.
7. 개인정보처리방침/이용약관은 아직 검토용 초안입니다. 운영자·문의처·시행일·보유/삭제 운영을 최종 확정해야 합니다.
8. 앱에서 사용하는 웹 화면은 이 저장소에서 작업합니다. iOS/Android 네이티브 패키징, 서명·스토어 제출 자료, 로컬 전용 어드민은 이번 전달 범위에서 제외했습니다.

## 6. Supabase·API·키 경계

- 인증/계정/지표 프로젝트: `yinxfrdkxohyttmkuaxa`. 이미 운영에 테이블과 수집 함수를 적용했습니다.
- 계정 테이블: `busan_account_events`, `busan_account_plans`, `busan_account_preferences`.
- 분석 테이블: `analytics_sessions`, `analytics_events`, `drop_plan_drafts`. 집계 뷰 7개는 `supabase/PRODUCT_ANALYTICS.md`에 있습니다.
- `supabase/migrations/20261109_account_persistence.sql` → `20261109_product_analytics.sql` 순서입니다. **기존 운영 프로젝트에 다시 실행하지 마세요.** 신규 환경용 SQL이며 초기 create table 구문입니다.
- 인증 프런트엔드는 공개 publishable key만 사용합니다. 관광 데이터 Supabase service_role은 서버에서만 사용합니다. 두 프로젝트를 혼용하지 마세요.
- 익명 좋아요는 로컬에서 `.local/event-saves.json`, 운영에서는 Vercel private Blob을 사용합니다. 로그인 계정 좋아요는 Supabase 계정 테이블을 사용합니다.
- 로컬 Node 서버는 인증 설정·행사 저장·주변 관광/맛집·장소/맛집 번역 API 경로를 제공합니다. 환경 변수 없이 실제 데이터 조회/로그인이 완성됐다고 판단하지 마세요.
- Vercel의 기존 운영 환경 변수는 이번 Git 전달에 포함되지 않습니다. 접근 권한은 서비스 담당자가 별도 제공합니다.

## 7. 전달 전 검증 및 다음 사람의 순서

```sh
npm ci
npm test
npm run build
npm run verify:handoff
npm run preview
```

- 이번 전달 검증과 화면 원본 해시는 `internal/releases/20261112-designer-handoff.json`에 기록했습니다.
- 프리뷰에서 지도·상세 시트, 로그인/가입/게스트, 마이와 지원 페이지까지 확인하세요. 실제 인증·데이터 변경은 테스트 환경에서 진행하세요.
- 과거 테스트의 오래된 브랜드 수·행사 순위·탭 이름·폐기된 카테고리/아카이브 경로 기대값을 현재 확인된 동작에 맞게 수정했습니다. 이를 위해 운영 동작을 이전 형태로 바꾸지 않았습니다.
- 우선 홈·매장 찾기·플랜 편집·저장·마이를 살펴보고, 375/390/430px 및 iPad에서 본문/탭바/키보드 높이를 확인하세요.
- 디자인 수정 전 작업 브랜치를 만들고, 완료 시 변경 화면·검증 기기·남은 사항을 커밋/PR에 적어 전달하세요. 이 저장소에 이번 개발본을 올리는 것과 운영 배포는 별도입니다.
