# BUSAN DROP — 개발 인수인계

## 빠른 실행
Python 3.10 이상만 있으면 실행할 수 있습니다. 프런트엔드는 별도 npm 설치나 빌드가 없는 HTML/CSS/JavaScript입니다.

압축을 풀고 최상위 폴더에서:

```powershell
python -m http.server 4187 --bind 127.0.0.1 --directory busan-drop
```

브라우저에서 http://127.0.0.1:4187/ 접속. 개발용 서버이며 운영 서버로 사용하지 않습니다. 이 방식은 공개 앱 폴더만 제공하므로 내부 도구는 웹에 노출되지 않습니다.

## 구조
- busan-drop/index.html: 앱 진입점과 프로토타입 스튜디오.
- busan-drop/app.js: 화면, 상품 데이터, 검색/필터/저장/상세, 구매 링크, 카운트다운.
- busan-drop/style.css: 모바일 UI와 데스크톱 스튜디오.
- busan-drop/assets/: 로컬 SUIT 폰트, 니베아 썸네일, 버전별 상품 이미지.
- busan-drop/thumbnail-assets.js: 내부 도구가 생성하는 공개 이미지 매핑.
- internal/thumbnail-pipeline/: 채팅용 썸네일 스타일·준비·적용·복구 도구.
- AGENTS.md: Codex가 작업을 이어갈 때 따르는 프로젝트 지침.

## 2026.11.02 브랜드·부산 개편
- 브랜드는 탑텐·올리브영·유니클로·자라 네 곳. 삭제된 브랜드의 상품과 저장 데이터는 함께 정리합니다.
- 홈은 상품 추천 대신 브랜드 행사 배너. 클릭하면 해당 내부 브랜드관으로 진입합니다.
- 탑텐 텐텐데이는 공식 10.23–11.08, 올리브영은 11.01–11.07. 한국 날짜 기준 D-day를 표시합니다.
- 유니클로 11.20–11.27, 자라 11.27–12.01은 공식 발표 확인 전이므로 D-day를 표시하지 않습니다.
- data/content.js가 브랜드 행사·탑텐 확인 상품·부산 스폿의 데이터 원본입니다. 검증 상태와 출처를 함께 유지하세요.
- 부산 테마관은 홈 카드와 하단 탭에 추가. 로컬/팝업, 전포/영도/센텀 필터와 상세·공식 링크 제공.
- 발란사·모모스커피 및 센텀시티 힐리먼트/JAAH 팝업 소개. 근거는 internal/CONTENT_VERIFICATION.md.
- tests/app.test.cjs: 모든 화면 렌더링, 브랜드0 클릭, 삭제된 저장 정리, 날짜 경계, 필터 조합 검증. `node --test tests/app.test.cjs` (Node 18 이상).

## 기존 유지 기능
- 홈·브랜드·탐색·저장·회원 체험·마이·상품 상세 화면.
- 니베아 상품: 전체/뷰티/올리브영 필터 및 올리브영 브랜드 상세에서 표시.
- 공식 확인 가격: 정상가 22,500원 → 판매가 12,500원부터, 표시 할인율 44%, 절약액 10,000원.
- 올영 블프: 2026.11.01–11.07. 한국 시간 11월 8일 0시까지 행사 카운트다운.
- 하단 구매 버튼에 진행 상태·남은 시간·바로 사러가기·행사 기간 통합.
- 상세·카드·홈 배너에서 니베아 썸네일 사용. 홈 배너 이미지 클릭도 상품 상세로 이동.
- 가격은 2026.11.02 확인 스냅샷이며 실시간 동기화가 아님. 상품별 가격 유지 기간은 별도 미확인.
- 탑텐 상품은 공식 기획전 확인 스냅샷. 실제 가입·결제·알림 서버 없음. 저장은 브라우저 localStorage.

## 상품과 이미지 수정
상품 데이터는 app.js의 product / deals / brands에서 관리합니다. 니베아 전용 가격·상세 레이아웃이 있으므로 다른 실상품을 추가할 때는 범용 데이터 모델로 확장하는 것이 좋습니다.

이미지 처리 절차는 internal/thumbnail-pipeline/README.md를 따릅니다. 생성 작업은 Codex built-in image_gen이 수행하고 Python 도구는 프롬프트 준비·검증·버전 보관·매핑 적용을 담당합니다. 방문자용 관리 UI는 없습니다. 원본 경로가 포함된 jobs 작업 로그는 전달본과 Git에서 제외하며, 새 작업은 prepare부터 시작합니다. 기존 공개 이미지와 manifest는 그대로 동작합니다.

## 배포
정적 호스팅에는 busan-drop/ 폴더 내용만 배포합니다. internal/, AGENTS.md, 임시 폴더는 배포하지 않습니다. API 키나 비밀 값은 필요하지 않습니다.

## 확인한 항목
- JavaScript 구문 검사.
- 잘못된 PNG와 경로 키 차단, 실패 시 기존 썸네일 매핑 보존.
- 공개 매핑의 이미지 해시·해상도, 로컬 원본 경로와 프롬프트 미포함.
- 홈 니베아 배너 이미지 연결, 다른 배너에는 이미지가 추가되지 않음.

## 출처
- 상품: https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000231772
- 기간: https://corp.oliveyoung.com/ko/newsroom/editorial/338

## Git 저장소와 전달본
- 기본 저장소: https://github.com/choiyeongseo-art/skp_team1
- 기본 브랜치: main
- 이 프로젝트 작업은 이 저장소를 사용합니다.
- 동료는 저장소를 clone하거나 커밋 기준 ZIP을 풀어 작업할 수 있습니다. ZIP에는 .git 이력이 포함되지 않으므로 푸시할 개발 작업에는 clone을 권장합니다.
- 썸네일 생성은 Codex image_gen 접근 권한이 있는 환경에서 가능하며, 일반 브라우저에서 자체 실행되는 AI 기능은 아닙니다.

## UI 문구 원칙
배너는 1:1 정사각형으로 행사명·기간·D-day·이동 버튼만 표시합니다. 전체 화면에서 장식용 영문·반복 설명을 제거하고 상품명·가격·위치·일정·미확정 표시·필요한 이용 조건만 간결하게 유지합니다.

## 레이아웃 점검
Astryx 스킬의 간격·타이포그래피·반응형 점검 기준을 적용했습니다. 현재는 비React 정적 앱으로 Astryx 패키지/CLI를 설치하거나 컴포넌트를 이식하지 않았습니다. 4/8px 간격 체계, 한글 단어 단위 줄바꿈, 상세 정보 그리드, 가격/카운트다운 줄바꿈 보호를 적용했습니다. 브라우저 실측 폭 339/390/417/430px에서 주요 화면·네 배너·네 브랜드관·상품/부산 상세와 가입/인트로를 나누어 점검했습니다. 검사한 화면에서 뷰포트 가로 넘침 및 텍스트 컨테이너 잘림이 없고 배너는 1:1입니다.

## 2026.11.03 방문 일정·취향 맞춤 홈
- 인트로와 홈 상단에서 도착일·마지막 날, 뷰티/패션/로컬·팝업 취향 선택. 선택 없이 탐색 가능.
- 설정은 기존 busan-drop localStorage에 저장하며 홈에서 변경·날짜 초기화 가능.
- 방문 기간의 양 끝 날짜를 포함해 겹치는 확정 브랜드 행사와 연결 상품, 팝업을 표시. 미확정 일정은 날짜 필터에서 제외. 상설 로컬 스폿은 유지.
- 행사 시작일과 방문일 사이의 간격으로 정렬하며, 방문일부터 진행 중인 행사를 먼저 표시. 동일 순서에서는 쇼핑 취향 우선.
- 취향에 따라 브랜드·배너·상품 순서 변경. 로컬/팝업 선택 시 부산 배너와 로컬 카드 우선 노출.
- 잘못된 기간 입력 안내, 행사 없는 기간 안내 제공. 기존 9개와 추가 2개 테스트 통과: node --test tests/app.test.cjs.

## 현재 UX 정리
- 최초 홈 진입에서 방문 날짜·쇼핑 취향 팝업을 한 번 표시. 취향은 복수 선택 가능.
- 방문 설정은 홈 하단 오른쪽에서만 표시·수정하며 방문일을 항상 노출.
- 상품 카테고리는 한 줄 가로 스크롤. 터치·마우스 드래그·방향키 지원, 더 이동 가능한 가장자리에 블러 표시.
- 포인트 컬러 #FFD628 고정. 로그인 체험 탭, 브랜드별 지도 핀, 헤더·부산·마이 모션 적용.
- 미등록 상품 이미지는 준비 중 문구만 표시. 기존 니베아 이미지는 유지.
- node --test tests/app.test.cjs: 15개 통과.

## 인트로 흐름·방문 설정 다크 테마
- 프로토타입을 새로 열면 저장된 언어 유무와 무관하게 인트로에서 시작. 언어 선택 후 방문 설정 팝업을 표시. 기존 날짜·취향은 입력값으로 유지. 같은 실행 중에는 홈 재진입 시 자동 팝업 반복 없음.
- 처음부터 체험 버튼은 방문 설정 표시 상태도 초기화. 방문 설정 전체를 차콜 배경·밝은 글자·노란 선택 테두리로 통일.
- 저장된 설정이 있는 경우의 진입 순서 테스트 추가, 16개 통과.

## 매장 저장
- 매장 상세 하트로 저장/해제. 브랜드와 지역 인덱스 조합으로 식별하며 busan-drop localStorage의 savedStores에 보관. 상품 저장과 독립.
- 지도 상단 저장한 매장만 필터는 현재 브랜드 범위에 적용. 저장한 매장이 없을 때 전체 보기 복귀 버튼 제공.
- 저장 핀은 기존 노란색에 민트(#91E2C7) 테두리와 하트 배지를 추가해 선택 확대 상태와 구분.
- 저장/필터/해제/브랜드 분리/재로딩 테스트 포함 총 19개 통과.

## 코럴 서브 컬러·홈 로컬 목록
- 서브 컬러 #FF5B3E. 매장 저장의 민트 테두리/배지를 코럴로 교체. 상세의 저장 버튼은 텍스트 없는 하트 토글로 변경, 저장/해제 토스트 제거. 접근성 이름과 aria-pressed는 유지.
- 홈 로컬/팝업은 차콜 #222428 바탕의 컴팩트 1열 목록: 행사명, 장소·기간, 오른쪽 상태 배지와 화살표. 부산 테마관 카드도 같은 차콜·코럴로 정리.
- 기존 노란색 주요 액션·브랜드 기능 유지. 총 20개 테스트 통과 및 브라우저 하트 토글/목록 확인.

## 목업 영역·구매 버튼 레이아웃 수정
- status 48px / nav 64px / safe-bottom 18px 기준으로 viewport를 절대 위치 지정해 공통 레이아웃 고정. 지도 viewport padding을 0으로 설정해 하단 90px 빈 공간 제거.
- 구매 액션은 본문에서 분리한 #detailActions에 렌더링, 본문 viewport가 해당 높이를 예약해 겹침 방지. 버튼 높이 48px, 바로 사러가기 문구만 표시. 니베아 타이머는 버튼 위에 작게 표시.
- 실제 브라우저에서 목업 높이 844px, 지도 높이 714px 및 지도 하단=탭 상단, 구매 버튼 높이 48px 확인. 회귀 테스트 포함 총 21개.

## 팔레트·부산 목록 통일
- 저장한 매장 핀의 별도 테두리/배지/효과 제거. 저장 기능과 필터는 유지하며 상세 하트와 상단 저장 필터는 #FFD628로 변경.
- 부산 테마관도 홈과 같은 컴팩트 1열 로컬 목록 사용. 녹색 상세 헤더는 #222428 차콜로 변경, 지역·팝업 상태에 코럴을 활용. 마이/브랜드 행사 패널도 차콜로 통일. 테스트 22개 통과.

### KTO 주변 관광지 연결 (2026-11-07)
- STEP 03은 행사장 좌표 기준 반경 3km의 KTO 관광지(contentTypeId=12)를 거리순으로 조회합니다.
- 서버 환경 변수 `KTO_API_KEY`가 필요합니다. Vercel 배포 시 환경 변수에 별도로 설정합니다. 키를 프런트 코드나 Git에 넣지 않습니다.
- 로컬 실행은 `.env.local`의 `KTO_API_KEY`를 읽습니다.
- API: `GET /api/busandrop/nearby-attractions?stores=매장ID` (여러 ID는 쉼표 구분).
- 전포 카페거리·해리단길은 추천에서 제외했습니다. 선택한 관광지는 브라우저에 저장됩니다.

### 공유 Supabase 관광지 연결 (2026-11-07)
- STEP 03은 ZEN WAY의 동일 Supabase `places` 테이블에서 `region=부산`을 읽습니다. 원본 쓰기 작업은 없습니다.
- 이전 KTO 실시간 조회를 대체합니다. 행사장 반경 3km, 직선거리순, 전포 카페거리·해리단길 제외. DB 조회 캐시는 5분입니다.
- 배포 서버 환경 변수: `TOURISM_SUPABASE_URL`, `TOURISM_SUPABASE_SERVICE_ROLE_KEY`. 프런트 또는 Git에 키를 넣지 않습니다. 로컬은 `.env.local`을 사용합니다.
- 반환 데이터에 원본 다국어 제목·설명·주소·방문정보가 포함됩니다.

### 관광지 이름 제외 필터 제거
- 이전 전포 카페거리·해리단길 제외 규칙은 폐기했습니다. 고정 추천을 제거하려던 요청을 DB 제외로 확장한 오류를 수정했습니다. 공유 Supabase의 모든 부산 관광지를 좌표와 3km 조건으로만 선별합니다.

### STEP 04 Supabase 음식점 연결 (2026-11-07)
- `busan_restaurants` 테이블 536개를 읽기 전용 조회합니다. 기존 고정 음식점 2곳을 대체합니다.
- `/api/busandrop/nearby-restaurants?stores=매장ID`: 선택 행사장 중 가장 가까운 곳과 직선거리 3km 이내 음식점을 모두 반환합니다. 동일 음식점은 한 번 반환합니다.
- 관광지와 같은 서버 환경 변수를 사용합니다. 원본 DB 쓰기 작업은 없습니다.
- 사진·이름·주소·직선거리·대표 메뉴·운영시간 표시. 사진이 없으면 음식 아이콘을 사용합니다. 선택한 음식점은 `foodPlaces`에 보관합니다.
- 로컬에 반영했으며 운영 배포 시 서버 환경 변수 설정이 필요합니다.

### 음식점 운영시간 정규화 (2026-11-07)
- `lib/restaurant-hours.cjs`는 원문을 요일별 구간, 브레이크타임, 라스트오더, 익일 영업으로 변환합니다.
- `auto_validated`는 규칙 검증 통과이며 현장 확인 의미가 아닙니다. `verifiedAt`은 null입니다. `needs_review`는 영업 여부를 추정하지 않습니다.
- 원본 Supabase 값은 변경하지 않고 API 조회 시 정규화합니다. `hoursNormalized`, `businessStatus` 필드를 반환하며 한국 시간으로 응답 시점 상태를 계산합니다.
- 공휴일·임시휴무는 별도 확인 대상입니다. 앱에는 등록시간상 표기와 원문, 접을 수 있는 요일별 시간표를 표시합니다.
- 전체 결과 JSON 및 검수 CSV는 개발 저장소 artifacts/event-detail-20261106/restaurant-hours-*에 있습니다.

### 드롭 플랜 저장과 마이페이지 (2026-11-07)
- 도착일은 한국 시간 오늘부터 선택합니다. 지난 편집 날짜와 그에 속한 방문 날짜는 오늘로 보정합니다. 저장한 과거 플랜의 조회 날짜는 유지하되 편집할 때 보정합니다.
- `busan-my-library` localStorage에 복수 플랜 스냅샷과 관광지·음식점 플레이스를 저장합니다. 플랜 편집 후 저장은 같은 ID를 갱신하며 새 플랜 만들기는 별도 ID를 만듭니다.
- STEP 04 저장/맛집 없이 저장 완료 시 마이페이지로 이동합니다. 저장된 플랜을 열어 날짜·행사·플레이스를 다시 확인할 수 있습니다.
- 기존에 완료된 로컬 플랜도 첫 로드 시 마이 라이브러리로 이관합니다. 계정/다른 기기 동기화가 아닌 현재 브라우저 저장입니다.

### 앱 자체 문구 5개 언어 (2026-11-07)
- 한국어·영어·일본어·중국어 간체·번체. 로그인 → 홈 → 매장찾기 → 드롭플랜 → 저장 → 마이페이지 순서로 적용했습니다.
- 행사 20개 제목과 앱 안내·버튼·알림·접근성 문구를 포함합니다. Supabase 관광지·음식점 이름·주소·설명·메뉴·원문 운영시간은 translate=no 또는 속성 원문 보존으로 제외합니다. DB 쓰기 없음.
- i18n-source.json 원문 1,693개, 최종 사전 1,742개, 수동 보정 키 216개. 긴 본문은 자동 번역을 포함하며 전 문장 원어민 검수 완료 상태는 아닙니다.
- data/i18n-translations.js 및 i18n-overrides.js 정적 자산과 integration/i18n.js가 DOM 문구·속성을 번역합니다. 방문자에게 외부 번역 API 요청은 없습니다.
- 개발 루트 scripts/collect-translations.cjs → build-translations.cjs → finalize-translations.cjs 순서로 생성합니다. build는 개발 시 공개 앱 문구를 Google 번역 엔드포인트로 전달합니다. 수동 보정 원본은 data/i18n-overrides.json입니다.
- 외국어 주요 6개 화면 점검, 일본어 카드 줄바꿈 보정. 관련 자동 테스트 36/36 통과. 로컬 반영이며 운영 배포·Git push는 하지 않았습니다.

### 저장 후 드롭 플랜 작성 상태 초기화 (2026-11-08)
- STEP 04 저장/맛집 없이 저장은 마이 라이브러리 저장 성공 후 작성 상태와 추천 지도·조회 캐시를 비우고 마이페이지로 이동합니다. 날짜는 유지하고 STEP 01·행사 선택 0곳으로 재시작합니다.
- 이전 완료 상태는 라이브러리에 보관됐는지 확인하고, 없으면 이관한 뒤 초기화합니다. 이관 실패 시 작성 내용을 유지합니다.
- 마이페이지에서 저장 상세 열기는 계속 가능하며, 드롭 플랜 탭을 누르면 새 작성 화면을 표시합니다. 편집 후 저장은 기존 라이브러리 ID를 갱신합니다.
- 저장 흐름 회귀 테스트 5개 및 기존 모델 테스트 포함 19개 통과. 브라우저에서 저장 → 마이페이지 → 드롭 플랜 재진입 → 새로고침의 선택 0곳 확인. 로컬 반영.

### 드롭 플랜 6개 흐름 개선 (2026-11-08)
- STEP 04 뒤 전체 일정 확인: 행사·관광지·맛집 통합 지도/목록, 장소 방문일 변경, 같은 날 순서 편집과 애니메이션, 구간별 대중교통 길찾기. 전체 순서를 스냅샷으로 보관합니다. 근접 지도 핀은 화면 44px 이내에서 묶고 확대 시 재계산합니다. 실제 좌표 유지, 다른 날짜는 연결하지 않습니다.
- 저장 상세는 마이 내부에서 조회하며 수정 버튼만 작성 화면에 진입합니다. 저장 후 최신 상세로 이동하고 작성 상태는 초기화합니다.
- 저장 탭은 관심 저장(행사/관광지/맛집). 플랜 선택을 관심 저장에 자동 추가하지 않습니다. 기존 관심 장소는 유지합니다.
- 맛집 이름·메뉴·주소 검색, 이름/메뉴 키워드 종류 필터, 선택한 맛집 필터 및 12곳씩 더보기. 키워드 분류임을 표시합니다.
- 현재 기준 상태와 방문일 정규 운영시간을 분리했습니다. 공휴일·임시휴무 확인 안내 및 검수 필요 시간의 추정 금지를 유지합니다.
- 마이 최상단 내 드롭 플랜, 계정/설정은 하단 접기 영역. 새 문구 4개 외국어 보정, Supabase 원문 번역 제외 유지.
- 단위·회귀 테스트 47개 통과. 브라우저에서 검색/필터/더보기, 전체 순서·날짜 변경, 저장·수정 시 중복 없음, 마이 상세 및 작성 초기화 확인.
- 로컬 반영, 운영 배포·Git push 없음. 저장은 현재 브라우저 기준입니다.

### 관광지·맛집 공통 카드 (2026-11-08)
- integration/place-card.js/css 공통 컴포넌트를 STEP 03·04 및 관심 저장의 관광지/맛집 목록에 사용합니다. 매장찾기 행사 카드의 104px 썸네일(350px 이하 94px), 분류/이름/핵심 정보, 우측 상단 하트, 구분선 구조를 참고했습니다.
- 주소는 두 줄 요약, 긴 소개와 메뉴/운영시간/방문일 시간표는 details 영역에 배치합니다. 일정 추가 체크박스와 관심 저장 하트는 독립입니다. 원본 DB 문구 번역 제외 유지.
- 사진 없는 카드도 동일 크기 아이콘 영역을 사용합니다. 관심 저장에서도 같은 마크업 사용. 하트 토글 시 SVG 아이콘을 유지하도록 수정.
- 브라우저로 카드/접기/하트/일정 추가/저장 및 영문 줄바꿈 확인, 관련 테스트 15개 통과. 로컬 반영.

### 現地訪問フロー / 현지 방문 길찾기 (2026-11-08)
- 마이플랜 상세에 날짜 선택, NEXT STOP, 현재 위치 길찾기, 방문 완료→다음 장소 표시를 추가했습니다. 지도를 자동으로 열지 않으며 사용자가 길찾기 버튼을 눌러 Google Maps를 엽니다.
- Google Maps URL은 목적지 좌표/주소와 dir_action=navigate, travelmode=transit을 전달하고 origin은 생략합니다. Google Maps가 위치를 사용할 수 없으면 사용자가 출발지를 입력합니다. 앱은 사용자 위치를 수집하지 않습니다. 실제 기기 위치를 사용하는 현장 내비게이션 검증은 하지 않았습니다.
- 방문 완료는 수동 체크이며 외부 지도 링크 실행으로 완료 처리하지 않습니다. 같은 날짜의 다음 미방문 지점을 강조합니다. 마지막 장소에서는 날짜별 완료 화면을 보여주고 다른 날짜로 자동 이동하지 않습니다.
- 플랜별 progress.done은 방문 날짜+방문지 ID로 보관합니다. 취소 및 새로고침 복원 지원. 플랜 수정·저장 시 동일 방문의 진행 상태 유지, 날짜/장소가 변경된 완료 기록은 정리합니다. 기존 계획 경로는 보조 접기 영역에 유지합니다.
- 사용 방법 3단계, 취소 방법·브라우저 저장 범위·Google Maps 위치 미제공 시 출발지 입력 설명 및 4개 외국어 번역 추가.
- 관련 테스트 24개 통과, 브라우저에서 다음 장소/날짜별 완료/취소/새로고침 복원 및 영문 줄바꿈 검증. 테스트 방문 체크는 모두 취소했습니다. 로컬 반영, 운영 배포 없음.

### 일정 날짜 선택 디자인 (2026-11-08)
- 방문할 날짜를 일정 날짜로 변경. DAY 번호/날짜/오늘 일정 표시를 묶은 전체 너비 컨트롤로 표현하며 native select를 유지해 키보드·모바일 선택을 지원합니다. DAY는 여행 시작일부터의 날짜 차이로 계산합니다.
- 여러 날짜에 방문지가 있을 때만 선택 가능. 방문지가 한 날짜에만 있으면 날짜 정보만 표시하고 선택기를 숨깁니다. 날짜 변경은 기존 일정 필터이며 방문 날짜를 수정하지 않습니다.
- 날짜별 일정만 표시한다는 안내 및 4개 외국어 추가. 브라우저에서 2일 일정 전환과 1일 일정 선택기 없음 확인. 로컬 반영.

### 명시적인 단계 표시·날짜별 동선 (2026-11-08)
- 하단 얇은 진행선을 번호/단계명(행사·동선·관광지·맛집)의 4개 항목으로 교체. 완료 체크, 현재 노랑 강조, 예정 회색 구분 및 aria-current=step. 본문 중복 진행 바 제거.
- 행사 방문일이 다를 때 날짜 정렬을 수동 순서보다 우선하도록 수정. 날짜 경계를 넘어 순서를 바꾸지 못하게 버튼과 핸들러에서 제한. 동선에 날짜 구분선과 방문 날짜를 표시하고 행사 기간은 보조 정보로 유지.
- 지도 연결선은 같은 날짜에 한해서 표시. 최종 일정과 현지 방문 기능의 기존 날짜별 진행 유지. 행사 선택에 날짜별 분리 안내 추가 및 4개 외국어 사전 보정.
- 관련 테스트 28개 통과. 브라우저에서 11/08, 11/10 방문일의 날짜 정렬/경계 이동 불가 확인. 테스트 날짜는 원래 11/08 및 여행 종료 11/09로 복원·저장. 로컬 반영.

### 하단 액션 영역 위계 통일 (2026-11-08)
- 4단계 모두 동일한 하단 안내 영역 사용. 행사: 필수/방문할 행사 1곳 이상 선택, 동선: 필수/같은 날짜 안의 순서 조정. 이 두 단계에는 건너뛰기 없음. 관광지/맛집은 선택 안내 및 기존 건너뛰기 유지.
- 진행 단계/제목·개수/주요 액션/안내 순으로 정돈. 옅은 구분선·라운드 상단·카운트 배지·보조 안내 라벨, 버튼 간격 통일. 신규 문구 4개 외국어 보정.
- 브라우저에서 STEP 01/02 건너뛰기 0개, STEP 03/04 건너뛰기 각 1개, 영문 누락/버튼 넘침 없음 확인. 로컬 반영.

### 드롭 플랜 하단 공간 절감 (2026-11-08)
- 중복 STEP/현재 제목 행을 제거하고 4단계 표시와 선택 수를 한 줄로 통합. 주요 버튼과 필수/선택 안내는 유지하며 불필요한 구분선·패딩 축소.
- 319px 폭 브라우저에서 기존 하단 223px, 변경 후 행사/동선 131px·관광지 136px 측정. 약 40% 절감. 주요 CTA 최소 44px 유지.
- 영문 누락/버튼 넘침 없음, 단계 이동·저장 동작 확인. 로컬 반영.

### Supabase 관광지 5개 언어 연결 (2026-11-08)
- 최신 요청에 따라 관광지 DB 번역 제외 조건을 해제했습니다. 음식점 데이터는 원문 유지합니다. 직접 조회 결과 부산 관광지 74개 모두 kor/eng/jpn/chs/cht의 이름·주소·요약·상세 소개·방문 정보 필드가 존재합니다. 내용의 원어민 품질까지 검수한 결과는 아닙니다. 문의처의 기관명 등 일부 원문은 DB 값 그대로 표시합니다.
- tourism-i18n.js가 앱 언어에 맞는 DB 필드를 표시합니다. 개별 번역 누락은 한국어 원문으로 대체하며 ID/좌표/방문일/완료 키는 보존합니다. STEP 03 목록·지도 선택 카드·관심 저장·최종 일정·마이플랜 NEXT STOP에 적용했습니다. 운영시간·휴무일·요금·주차·문의 및 접힌 상세 소개도 연결했습니다.
- 읽기 전용 /api/busandrop/tourism-translations 엔드포인트로 기존 저장 스냅샷도 최신 번역을 표시합니다. 서버 전용 키 유지, 부산 공개 관광지 메타데이터만 반환, 5분 캐시. DB 쓰기 없음. Express 및 Vercel API/rewrite 구성 포함.
- 관련 테스트 23개 통과. 브라우저에서 5개 언어 저장 관광지명, 영어 목록/지도/최종 일정/NEXT STOP 및 음식점 원문 유지 확인. 로컬 적용, 운영 배포 없음.

### 음식점 가공 필드 우선 연결 (2026-11-08)
- 최신 사용자 요청에 따라 음식점 DB 문구 번역 제외를 해제했습니다. busan_restaurants의 name_i18n/address_full/address_i18n/menu_i18n/hours_formatted/hours_i18n/detail_i18n/cuisine/meal_types 조회 및 적용. 이미지 main_img_normal 우선. 미가공·빈 번역 필드는 한국어 원문으로 대체. 운영시간 판정은 기존 원본 정규화 유지(표시용 포맷과 분리).
- 음식점 160개 가공 완료, 운영시간 보유 대상 471개 중 나머지는 원문 표시. 음식 분류는 등록 cuisine 우선, 미등록은 기존 키워드 분류. 검색은 5개 언어 이름/메뉴/주소 지원.
- /api/busandrop/restaurant-translations 읽기 전용 캐시 엔드포인트로 관심 저장/마이플랜의 예전 스냅샷도 표시 갱신. ID/좌표/방문 날짜/완료 키는 유지.
- 관련 테스트 28개 통과. 브라우저에서 굿모닝홍콩 5개 언어 이름·주소, 영어 검색/설명/메뉴/요일별 운영시간 확인. 기존 플랜 선택 유지·동일 플랜 저장 복원. 로컬 반영, 운영 배포 없음.
- 앞 배치의 주소 전처리가 부산진구의 부산까지 제거하던 문제 수정. 1480/1482 address_full의 중복 진구를 정상화하고 재조회 검증. DB 작업 스크립트도 공백이 있는 부산 접두어만 제거하도록 수정.

### 음식점 20곳 단위 DB → 웹 작업 (2026-11-08)
- 사용자 지시로 20곳씩 Supabase 저장 후 웹 확인. 161~180번째 20곳 완료. 누적 가공 180/471, 남은 291, 다음 181~200 어가초밥부터. 1225/1226은 API 메뉴 없음으로 메뉴 번역 생략, 5개 번역 필드 전체 보유는 178곳.
- 웹 엔드포인트의 신규 20곳 392개 번역값 DB와 일치. 소수인 영어 메뉴/원화 가격/정리 시간/주소 렌더 확인. 기존 플랜 선택 유지. 미래 배치 기계 번역 초안은 로컬 캐시에만 있고 DB/웹에 반영되지 않음. 로컬 반영, 운영 배포 없음.

### 최신: 161~180 폐기, 1~160 검수만 (2026-11-08)
- 사용자 요청으로 161~180 가공 필드 20곳을 저장 전 백업으로 복원. 160번 유지, 원본 API 행 삭제 없음. 누적 유효 가공 160/471, 남은 311. 배치 재적용 스크립트 차단. 기존 160 내용 수정 없음.
- 검수: DB↔웹 API 160곳/3,200개 번역값 일치, 빈 필드 0. 카드 HTML 800조합 검사. 등록 행사장33곳 반경3km 조회 정상(대상160중115곳 반경내,45곳 반경외). 브라우저 120번 기장손칼국수 5개 언어 표본 확인.
- DB 번역 내용 한글 혼재: 영어2필드/2곳(1번·2번 메뉴 미번역), 일본어90필드/71곳, 간체83필드/53곳, 번체82필드/52곳. 연결 문제와 구분, 일부 상호 의도적 표기 가능. 검수만 수행, 수정 없음. 상세 busandrop_db/restaurant-continuation/audit-first-160.md. 로컬 기준, 운영 배포 없음.

### 저장 = 찜한 행사, 마이 = 완성 플랜 (2026-11-08)
- 최신 사용자 지시로 저장 탭에서 관광지/맛집 분류 및 마이플랜 바로가기 제거. 행사 찜 목록만 표시. 개별 관광지·음식점 하트 제거, 일정 추가는 유지. 이전 장소 찜 저장값을 삭제하는 마이그레이션은 수행하지 않음.
- 마이페이지는 저장 플랜 목록/상세/수정/방문 진행 관리. 계정 설정은 접기 영역. 저장 플랜 3개 유지. 기존 작성→저장→마이 이동/작성화면 초기화 흐름 유지.
- 저장/마이 메인 상단을 매장찾기·드롭플랜과 같은 pass-title(영문 라벨→h2)로 통일. 중복 영문 라벨 제거, 섹션 제목 h3 구분. 319px 실측 4개 화면 제목30px/행간36px, 영문12.5px 및 색상 일치(350px 초과 제목32px).
- 새 문구 4개 외국어 추가, 5개 언어 제목/행사 목록/플랜 목록 및 플랜 상세 진입 확인. 행사 찜 테스트 후 원래0개 복원. 모델/저장/방문 관련20개 테스트 통과. 로컬 반영, 운영 배포 없음.


## 2026-11-08 — 한국 시간 행사 종료 공통 숨김
- event-window에 종료일 포함 KST 만료 판단, 지점/저장 플랜 사본 필터 추가. 호텔 예약형은 예약 기간 기준. 날짜 미확정은 추정 삭제하지 않음.
- 매장찾기 목록/브랜드 필터/지도, 찜 목록·개수·플랜 seed, 드롭플랜 후보/저장 경로, 마이플랜 요약/지도/다음 방문지, 공유 상세와 구형 상품/브랜드 진입에 적용. 원본/서버 찜/사용자 플랜 저장 원본은 삭제하지 않음.
- 날짜 변경은 30초 확인, 포커스/탭 복귀 때 갱신. 기존 상세 닫고 화면 재계산.
- 2026-11-08 데이터: 20개 행사 중 올리브영 1개 종료, 33개 지점 중 해당 3개 제외 → 화면 19개 행사/30개 지점. 종료 당일인 11/8 호텔 예약 행사 유지 확인.
- 부산 도착일 표시 문구와 4개 외국어 번역 반영.
- 핵심 9개 테스트 파일 63개 통과. 기존 event-window/store-events-model의 정적 데이터 개수 기대치를 이미 추가된 로컬 행사 데이터(20개/33개)에 맞게 갱신.
- 추가 실행한 store-mapbox.test.cjs는 기존 4개 실패 유지(지도 모드에서 목록 텍스트 기대, 이전 쇼핑패스 탭명, 디저트 분류 기대). 변경 전 미러 코드로도 같은 4개 실패 재현 확인.
- 브라우저: 매장찾기 19/30, 올리브영 브랜드/카드 없음; 저장 빈 상태; 마이 3개 플랜 보존. proof: artifacts/event-detail-20261106/expired-events-hidden.png
- 사용자 최신 설계 방향: 날짜별 스케줄링 거절. 기간만 받고 행사별 방문 기한을 표시하는 후보 목록 + 현지에서 오늘 유효한 행사 추천 방향 제안. 아직 날짜별 편집/저장 구조 제거 작업은 하지 않음. 사용자가 제안 검토 중이므로 전체 흐름 개편 완료로 보고하지 말 것.
- 배포/커밋/푸시 없음.


## 2026-11-08 - Venue-centered Drop Plan
- Removed per-place date scheduling from the active flow. Arrival/departure determine event candidates; each selected event venue gets sights then food, both optional, before moving to the next venue. Review and My show event/sights/food groups.
- tripSelection.venueChoices[campaignId] owns storeId and selected sight/food IDs and records. Skipping clears only the current venue/kind. A branch change resets only that venue. API queries use one current store ID, within 3 km; stale responses are ignored by request-object identity.
- New saved plans: flow=venue-groups. Each place keeps its original ID plus eventId; visit IDs include campaign IDs so repeated source places can belong to multiple groups. New plans do not persist assigned visit dates.
- Review allows editing a single venue and returning directly to review. Save archives to My and clears the editor. Legacy plan views retain existing completion IDs/date keys without showing date scheduling.
- My displays venue groups first; directions and visit tracking are expandable. Mark complete advances to the next available stop, undo is supported. Recommendations respect current event dates and known closure days.
- Global notice explains different event end dates; every group shows its deadline. Expired new groups leave active navigation together, without deleting stored sources.
- Five-language UI maintained: 1874 dictionary entries, 356 curated overrides.
- Ten focused test files / 63 tests pass. Browser verification: Nov 8-12, Wackywilly with Busan Citizens Park and Mu Gung Hwa; Tuna School with skipped sight and Baunova food. Saved as plan04, preserving plans01-03. Reload preserved 2 groups and 3 nearby stops. Complete Wackywilly -> Citizens Park verified then undone. Foreign-language notice and event names checked in EN/JA/CHS/CHT, returned to Korean.
- Sample plan04 remains in test browser. No Supabase data edits, commits, push or deployment.


## 2026-11-08 - Account styling and plan management
- Drop Plan notice heading has a decorative sparkle; added login/create CTA and My edit/delete guidance. Login CTA goes to the existing demo login screen. Both notice and account panel explicitly disclose browser-only storage; real authentication/account sync was not implemented or claimed.
- My page order: page heading, expanded account/settings, language and service rows, then saved plans. Yellow/ink identity/login treatment, bordered settings rows, language badge, separate plan open/edit/delete actions. Language picker returns to My instead of Home; service sheet describes the current venue flow and storage.
- Added pure model.deletePlan and a confirm/cancel dialog. Only the pending matching ID can be removed. On successful deletion, clear a matching unfinished draft via discardSaved. Dialog supports cancel, outside click, Escape, focus return and keyboard focus wrapping. Existing plans are not deleted during browser verification.
- Tests cover deletion immutability, unrelated plans/bookmarks/progress, missing IDs, modal cancellation, stale confirmations, draft reference cleanup, layout order, language copy and existing plan flows. Browser verified 4 plans remain after cancel; edit opens editor, login opens demo screen, service sheet opens, English settings/controls translated and language flow returns to My.
- Last related UI changes: settings remain expanded; food filter is type-only; sights and food show 10 initial results then add 10 via More; no per-place date scheduling.
- No Supabase data changes, deployment, commit or push.


## 2026-11-08 - Drop Plan action dock spacing
- Replaced the old compact footer markup with pass-action-dock: left-aligned stage label, right-aligned count badge, explicit text/arrow flex slots, 48px minimum primary/back actions and separated help/skip row. Review uses the same structure.
- Removed the fixed 80px viewport reservation. Measure #detailActions into --pass-dock-height and update through ResizeObserver and window resize; disconnect when leaving Pass. Reserve exactly that height above navigation and keep 24px bottom padding in the scroll content.
- Browser at 319px: empty selection dock 138px tall, final card 36px above dock; viewport ends at dock top. Sights stage dock 153px tall and viewport still ends at dock top. Verified selected count, disabled action, restored original two selected events and entered recommendations.
- Updated map-add count selector to the new badge. Help text reflects empty selection, valid selection or unresolved branch. Four foreign-language copies supplied.
- Proof: artifacts/event-detail-20261106/drop-plan-dock-spacing.png. No deployment or database changes.


## 2026-11-08 - Direct branch event navigation
- Multi-branch event cards now show an overview map and numbered full venue-name actions instead of district chips plus a selected-branch preview. Each list action and numbered map pin opens BUSAN_OPEN_EVENT_DETAIL with the matching original store ID. No intermediate selection/fly-to step.
- All valid branch coordinates remain in fitBounds; All locations resets bounds. Map failure leaves name actions available. Added Traditional Chinese guidance; all five UI languages have instruction/action copy and existing venue-name dictionary remains active.
- Added store-branch-navigation.test.cjs: six passing tests covering nine Uniqlo names, direct actions, coordinates and pin links, map fallback, five-language guidance, and stale filtered-out IDs. Browser visual verification was unavailable because automatic approval review could not complete due to usage limit; no screenshot claimed.
- Cache: 20261108-branch-direct1. Mirrored source and test into team-web. No database or deployment changes.


## 2026-11-08 - Tourist pin reveals introduction
- Clicking a tourist pin now renders its existing introduction and smoothly scrolls only #viewport to the card start with a 12px top gap. Uses actual viewport/card rectangles plus current scrollTop, preserving the outer studio page position. Existing measured action-dock reservation keeps the scroll viewport above fixed actions.
- Initial map render, close and add/remove do not trigger automatic scrolling. Reduced-motion preference uses immediate scrolling.
- Verification: tour-preview-scroll, venue-flow and pass-save-flow: 13 tests passed. Source mirrored into team-web; shopping-pass.js cache 20261108-tour-pin-scroll1. Live browser visual check remains unavailable due to prior tool usage/approval-review limit.


## 2026-11-08 - Taller final review map
- Scoped final Drop Plan review #libraryRouteMap height to clamp(400px,58svh,500px), matching the existing store finder reference. Previous height was 260px. Saved My plan map size is unchanged.
- User requested proposals for replacing sequential numeric pins; no pin behavior changes applied pending design direction. Proposed venue-based groups, category icons, compact place preview, count clusters that expand, and per-venue focus controls.
- Cache my-library.css: 20261108-review-map-tall1; mirrored. Browser visual verification remains unavailable due to tool usage/approval-review limit.


## 2026-11-08 - Venue group review maps and restaurant map tab
- Final review and saved-plan maps use shared ticket/event, map/sight and fork/knife/food SVG pins. Large yellow venue pins include event labels. Nearby screen-space pins cluster at 48px with a place count; clicking fits the cluster and reveals every place with a link to its original list row. Same-coordinate places remain selectable in that list.
- Added All/venue chips: selected group fits bounds and stays prominent, other pins/lines dim. Lines connect each venue to its own nearby places, avoiding a misleading global visit order. Map text follows UI language. Review height keeps prior 400–500px setting.
- Food recommendation stage now has independent list/map state, cuisine filtering in both views, all valid matching coordinates on the map, fork/knife pins, processed menu/hours preview, per-venue add/remove and existing auto-scroll to preview. List continues ten results per More. No per-place scheduling added.
- Eight new map tests cover tabs, filters, food selection scope, pins, venue focus, clusters, within-group lines and valid food map coordinates. Related suite totals 36 passing tests. Browser visual QA unavailable due to usage/approval review limit; no visual proof claimed.
- Four foreign-language UI copies added; cache 20261108-venue-food-maps1. Mirrored into team-web. No database edits, deployment, commit or push.


## 2026-11-08 - Nearby list spacing and separate plan totals
- Nearby sights/food result count has 22px above and 16px below, 1.8 line-height, tabular numbers and 3px word spacing. More button has 26px separation from the following note.
- New shared planSummary derives event count and separate sights/food counts. Used in final review, My saved-plan cards and My detail; all five languages support the dynamic three-part summary. Stored data is unchanged.
- Count derivation/zero categories and multilingual totals tested, with existing management/flow/save checks: 21 tests passed. Cache 20261108-count-spacing1; mirrored source/tests. Browser visual QA remains unavailable due to usage/approval-review limit.


## 2026-11-08 - Review travel summary and per-venue maps
- Final review now shows labeled My travel dates first, followed by Planned visits with venue / sight / food counts. Added matching dynamic translations for all five languages.
- Each editable venue card contains a 240px map with only that campaign's valid coordinates, category icons, event-to-nearby group lines, zoom controls, place-name feedback on pin click and fit-to-group bounds. Exact shared coordinates fan markers horizontally without changing source coordinates.
- Card maps mount near the viewport via IntersectionObserver, and maps/markers/observer are disposed on rerender or leaving review. Existing full overview remains below all cards. Saved My detail is not given extra card maps by this review-only request.
- 32 related tests passed, including map scope, cleanup, 240px style and review label/order/multilingual counters. Browser visual QA remains unavailable due to prior tool usage/approval-review limit. Cache 20261108-review-venue-mini1; mirrored. No database or deployment changes.


## 2026-11-08 - Thumbnail visit-order editor
- Final review group rows now use original campaign banner/place images on the left, name/address/directions in the middle, and up/down arrow buttons on the right. Event names are shown on event rows too; redundant category text removed. Missing images use category icon fallback. Saved My rows share the visual structure without review arrows.
- Added immutable moveVenueStop and per-campaign selection.venueOrders. Any stop, including the venue, can move within its group. First/last arrows disabled; other groups cannot be crossed. Stable scoped IDs retain order after saving, reload and editing; stale IDs drop out and new selections append. No date scheduling.
- Review passes venueOrders to groupedRows, archive itinerary uses them, and saved My journey follows the same order. Overview and 240px card-map lines now connect consecutive stops within each group. Existing coordinates/images remain unchanged.
- 41 related tests passed including arrow actions through archive/reopen, model boundary/isolation/persistence, thumbnail markup and existing map/management/i18n/save flows. Browser visual QA remains unavailable due to usage/approval-review limit.
- Cache 20261108-venue-stop-order1; mirrored source/tests. No database writes, deployment, commit or push.


## 2026-11-08 - Popup pins, route direction and reorder motion
- Store map exposes its existing category pin factory; shared event mapIcon reuses the exact POP-UP storefront artwork. Final review maps show matching per-group step badges on map pins and thumbnail cards, plus repeated directional chevrons along ordered connections. These remain order guides, not road routes.
- Reorder captures old card positions and applies a 480ms FLIP movement to both swapped cards after render, with brief moved-card emphasis. Reduced-motion skips animations; viewport position remains unchanged.
- Moved nearby-place edit button from above the map into the right side of the map footer. Hint/selection text has 18px gap above and 20px below before the divider.
- New tests verify both animation directions, reduced-motion, exact shared popup artwork, arrow map layer and relocated footer control. Related suite: 44 passing tests. Browser visual QA unavailable due to usage/approval-review limit.
- Cache 20261108-route-motion1; mirrored. No database edits or deployment.


## 2026-11-08 - Review label cleanup
- Removed the venue-centered-plan overline. Event name now starts directly beside the numbered badge with aligned top edges.
- Review travel period uses YYYY.MM.DD - YYYY.MM.DD; schedule uses middle-dot bullets between venue/sight/food counts. All five languages retain bullet separators. Cache 20261108-review-labels1, mirrored.


## 2026-11-08 - Per-venue map management actions
- Removed initial pin hint. Map footer now contains Edit plan / Delete plan; selected pin name remains available only after a click. Edit opens the existing group recommendations editor. Delete removes that campaign's draft selection, nearby places and custom order, retaining other groups; deleting the last group returns to event selection. Does not delete the saved My plan record before saving edits.
- 20 related flow/map/motion tests passed including scoped removal and empty-draft behavior. Cache 20261108-venue-manage1, mirrored. Browser visual QA remains unavailable due to tool usage limit.


## 2026-11-08 - List-first venue review layout
- Review group sequence: number/event name, compact dotted-date deadline, visit-order thumbnail list, 240px local map, then Add/change places and Delete plan. Placed visit-order heading and arrow guidance above the list.
- White compact identity header, yellow numbered badge and subdued deadline pill; separated map/footer with a soft gray background. Improved image, arrow-control and row spacing; secondary place-edit control is soft yellow and deletion a low-emphasis text action. Stable order IDs and handlers unchanged.
- Updated existing layout/order regression assertions to require list before map and management after map. Four-language translations supplied. Related map/flow/motion tests: 20 passed; broader related suite checked below. Browser visual QA remains unavailable due to usage limit.
- Cache 20261108-list-before-map1; mirrored. No database edits, commit, push or deployment.


## 2026-11-08 - Drop Plan marker coordinate anchoring fix
- Found root marker CSS position:relative on .venue-map-pin and .venue-map-pin.is-event. These overrode Mapbox marker positioning and introduced normal-flow layout offsets. Removed both declarations; explicit #phone .venue-map-pin.mapboxgl-marker uses position:absolute; top:0; left:0; margin:0. Mapbox inline transforms remain owned by Mapbox.
- Removed manual horizontal fanout for identical coordinates in card maps. Identical coordinates now share one marker with all matching step numbers/names and zero marker offset, preserving the source location.
- Overview resizes before fitBounds; mini-map top fit padding increased from 40px to 62px for popup artwork/badge clearance. No source coordinates or DB records changed.
- Added regression checks for every root marker CSS position and zero-offset shared-coordinate markers. Related tests: 38 passed. These are source/behavior mock tests, not a browser zoom or visual verification; browser remains unavailable due to tool usage limit. Cache 20261108-marker-origin-fix1, mirrored.

- 2026-11-08: Removed the overview-map explanatory paragraph beginning 연결선은 선택한 방문 순서이며, per user request. Cache 20261108-remove-route-note1.


## 2026-11-08 - Overview individual coordinate pins
- Removed the overview map's 48px screen-space clustering and count markers. Every valid place now has an independent category/step marker at its exact [lng,lat], with zero offset; marker click shows only that place. Zoom no longer removes/regroups markers, leaving positioning to Mapbox. Venue focus/dimming and route lines retained.
- Updated regression verifies nearby and identical-coordinate points each retain separate markers and unchanged coordinates. Related tests: 22 passed. Per-venue mini-map exact-coordinate shared-marker behavior is unchanged; this request targets the bottom full overview. Cache 20261108-overview-single-pins1, mirrored. Browser visual QA unavailable due to tool usage limit.


## 2026-11-08 — Saved plan travel navigation and stamps
- My Drop Plans now explains travel use. Saved detail exposes one current-location Google Maps directions CTA above venue cards, targeting the first currently eligible uncompleted stop; per-place directions removed from this view. Google Maps handles device location; completion remains manual.
- Completed cards show BUSAN DROP / ↘ stamps rotated -13 degrees inside the name/address area, with a 520ms stamping effect only on a new completion; reduced-motion skips it. Each completed card retains a cancel button. Complete/undo persists locally and recomputes the next stop; all-complete state removes directions. No OAuth, Supabase or map-coordinate changes.
- Corrected updateVisit to resolve the same grouped rows/legacy IDs displayed on screen, including plans without stored itinerary. Four foreign-language translations added.
- Validation: 38 targeted model/UI/motion/translation tests passed; syntax checks passed. Live browser visual QA remains unavailable due browser-tool usage limit.


## 2026-11-08 — ZEN WAY login UI port
- Read ZEN WAY src/app/login/page.tsx, components/email-sign-in.tsx, privacy/page.tsx, terms/page.tsx, legal-document.tsx. Exact source snapshots + SHA256 provenance retained under internal/login-reference (no secrets).
- Added integration/login.js/css overriding signup: original editorial spacing/provider SVGs/50px square controls/guest/legal footer, blank white backdrop, readable dark controls, exact home wordmark with ↘, headline 부산 방문 전 꼭 확인하기. Login UI translated into all five UI languages.
- Privacy/terms open keyboard-accessible scrollable dialogs with TOC, close/back/Escape/focus return. Original policies were explicitly drafts. Adapted current BUSAN DROP documents preserve draft status and distinguish local plans/stamps/external maps from unimplemented account synchronization; operator/contact/effective date remain pending. Korean legal draft is lang=ko translate=no, avoiding incomplete automatic legal translations.
- Google/Apple handlers truthfully disclose pending setup; email keeps source pending disclosure. No ZEN WAY Supabase credentials, sessions, OAuth callbacks, analytics, or account databases copied; no false successful login. Real authentication still requires BUSAN DROP provider configuration.
- Validation: 29 targeted login/i18n/plan/journey/flow tests passed; syntax checks passed. Browser visual QA unavailable due existing tool usage limit. No deployment.


## 2026-11-08 — Primary page URLs
- Canonical routes: /busandrop/login (signup login UI), /home, /stores, /drop-plan, /saved, /my. Each route directly loads its matching screen. In-app tabs update URL; popstate restores screen without another history push, closes modal and resets viewport. Language/intro retain login URL; other legacy subviews retain home.
- Route initialization moved after all screen modules, including login and shopping-pass, to make direct links render the installed views. Updated local Express, mirror Express and Vercel rewrites; no remote deployment. Trailing slashes redirect to canonical route preserving query.
- Validation: 11 routing/login tests passed. Existing local PM2 busan-dashboard restarted to apply server route changes.


## 2026-11-08 — Dedicated Supabase authentication implementation
- User explicitly chose a BUSAN DROP-specific Supabase project; no ZEN WAY or tourism project credentials reused. User is creating the new project; Project URL/publishable key still pending. Actual provider logins NOT yet verified.
- Added pinned MIT Supabase JS 2.115.0 UMD from installed ZEN WAY dependency with license. auth-client uses dedicated storage key, PKCE OAuth, fixed /busandrop/auth/callback, explicit code exchange, server getUser validation on restoration, auth event updates, local session sign-out. No trust in stored prototype joined flag.
- Login Google/Apple call real SDK OAuth; email send/verify form with single-flight guard, 60s resend countdown, invalid/expired/rate-limit errors. Session-authenticated profile and logout; plans remain local, no account sync.
- Runtime /api/busandrop/auth-config only allows BUSANDROP_AUTH_SUPABASE_URL and publishable/anon key; rejects secret/service-role keys and never falls back to TOURISM variables. Added Express/Vercel endpoint and callback route, explicit base path for nested callback assets.
- Updated draft legal copy for wired authentication capabilities; no server-plan storage claims. Setup doc docs/AUTH-SETUP.md lists local env/redirects, Google/Apple console steps, OTP mail templates/SMTP and manual test matrix. UI translations updated.
- Validation: 38 targeted tests passed (includes 8 auth behavior/config tests); SDK calls mocked, actual provider success still pending project configuration and user verification. Browser visual QA unavailable.


## 2026-11-08 — Dedicated project connected
- User supplied dedicated Supabase Project URL (normalized by removing /rest/v1/) and publishable key; stored only in ignored .local/auth.env and team-web/.env.local. No service-role key used.
- Read-only /auth/v1/settings returned HTTP 200: email=true, google=false, apple=false, disable_signup=false, mailer_autoconfirm=false. Local app flags match those provider settings.
- Remaining: user console configuration for OTP email template/SMTP, app redirect allowlist, Google and Apple provider credentials. Actual mail send/user OTP/OAuth success remains unverified. Unit/integration checks remain 39 passed from prior implementation turn.


### 2026-11-08 · My page controls and visit stamp
- Compact account settings and collapsible trip guidance bring saved plans closer to the page top. Visible plan count matches visible cards.
- Edit/delete/view use distinct 44px buttons; view uses brand yellow. Existing deletion confirmation retained.
- Visit stamp overlays name/address with yellow/ink styling; removed completion-only height/padding reservation.
- Root and mirror assets synchronized; cache version my-actions3. Syntax check and 19 management/venue/i18n tests passed. Browser visual verification remains pending.


## 2026-11-09 — Journey cards and reorder feedback
- My list actions remain View / Edit / Delete, guide always expanded and title count removed. Whole-plan deletion remains My-list-only. Journey top edit/delete toolbar and generic date notice removed; name can be edited inline. Saved editor and journey can reorder event groups and their stops.
- Reordering now animates both changed groups/stops for 560ms (reduced-motion respected). Scroll/focus targets the replacement at the original slot, rather than following the outgoing group.
- Journey place cards use a full-width footer: Complete / Up / Down / Delete, minimum 44px controls. Stamp remains an absolute yellow/ink overlay with no reserved height.
- Place deletion requires confirmation, updates stored selection/itinerary/next destination and prunes only removed visit stamps. Removing an event removes its linked nearby sights/food as explicitly disclosed in confirmation. Other event groups remain intact.
- Root and mirror source, translations and tests synchronized; cache 20261109-journey-cards11. Validation: 25 management/venue/i18n tests passed, including replacement-slot anchoring, motion and group-scoped deletion. Browser visual verification unavailable due existing tool usage limit; no deployment.

## 2026-11-09 — Operating hours on journey cards
- Venue stop cards display operating hours directly below addresses, expanded in journey/editor views. Event hours and their source caveats come from the saved event snapshot; food uses hours and sights use localized visitInfo.usetime. Missing data displays 확인 필요; no hours inferred. Root/mirror synchronized, cache journey-hours12. Existing 25 targeted tests passed.

## 2026-11-09 — Multi-line operating hours
- Card hours now have a separate label and stacked schedule rows. Formatter splits spaced slashes, existing line breaks/HTML br, seasonal list separators and ※ notes while preserving numeric time/month ranges. Notes rendered separately with compact spacing. Source data unchanged; escaped output. Root/mirror synchronized, cache journey-hours13. All 10 management tests passed, including weekday/seasonal/time-range examples.

## 2026-11-09 — Plans first on My page
- My opens directly with 내 드롭 플랜 and existing expanded travel guide/cards. Language and service controls moved below the plan list; signed-in logout remains in this bottom menu. Removed My Page title, account/settings heading, BUSAN DROP identity/login status, guest invitation and local-storage introduction from page. Root/mirror synchronized; cache my-plans-first14. Management tests: 10 passed.

## 2026-11-09 — My title and separate settings actions
- Restored saved-page-style MY PAGE / 마이페이지 title. Below: 내 드롭 플랜 heading, expanded travel guide and saved plan cards; then 설정 heading. Language / service / signed-in logout buttons are separate bordered controls with spacing, no shared account-menu container. Removed account identity/copy remains absent. Settings translated in four foreign languages. Root/mirror synchronized, cache my-settings15; 19 management/i18n tests passed.

## 2026-11-09 — Travel guide visual emphasis
- Always-expanded guide restyled with 4px corners, ink outline, solid yellow offset shadow and boxed brand arrow. Existing explanation retained, with numbered semantic three-column steps for directions / completion / next destination. Settings and plan controls unchanged. Root/mirror synchronized; cache drop-guide16. 19 management/i18n tests passed; no browser visual verification.

## 2026-11-09 — Center clicked card after reorder
- Latest user instruction supersedes replacement-slot anchoring: order snapshots now track clicked stable place/group ID. After rendering, center the moved place card; for potentially tall event groups center the event heading and its controls. Viewport-edge constraints respected. Applied shared behavior to live journey and saved editor stop/group controls; existing swap motion retained. Root/mirror synchronized; cache reorder-center17. 17 management/venue tests passed.

## 2026-11-09 — Next-stop localization and tab highlight
- Next-stop name/address now use the same tourism/restaurant display dictionary as place cards, including async dictionary load and existing language-ready rerender for old saved plans. Event addresses are no longer excluded from interface translation. Directions still use original coordinates/values.
- Active bottom tab replaces circular outline with a full-slot soft pale-yellow radial gradient; icon/label layout and current-page semantics retained. Root/mirror synchronized, cache next-stop18 / gradient-nav3. 23 journey/management/tourism-localization tests passed; browser visual QA unavailable.

## 2026-11-09 — Production deployment
- User requested deployment of all current work and explicitly approved encrypted registration of existing KTO and tourism Supabase server keys into Vercel manoken2/busandrop Production. Auth public config and provider flags registered too; no secret values printed/committed.
- Deployed from team-web with vercel deploy --prod --yes --scope manoken2. Deployment dpl_7k5E1ya6R8MN34NeBjj4UpqVkygf READY; alias https://busandrop.vercel.app, immutable https://busandrop-qoja4szyq-manoken2.vercel.app.
- Runtime verification: login/home/stores/drop-plan/saved/my/auth-callback all HTTP 200 with latest cache version. my-library JS/model/CSS, shopping-pass JS and light-theme CSS byte-match local. Auth config configured=true (Google/Apple/email flags true); tourism dictionary HTTP 200/74 places, restaurant dictionary HTTP 200/471 places. Actual OAuth provider completion was not tested in production.
- Build passed. Full mirror test suite 151: 143 passed, 8 failed. Remaining failures are older store-mapbox UI/name/category expectations and supplied-banners brand/deadline expectations plus its archive fixture path. Do not claim full suite green. Updated place-map test loader for hours helpers and synchronized pass-model/supplied-banner root test changes. No product logic changed to satisfy stale expectations.

## 2026-11-09 — Settings logout localization; next phase
- User requested app distribution packaging as the next morning phase; no platform/package implementation chosen yet. Immediate task: fix settings logout translation and redeploy. Added standalone logout and guide next-stop strings in English/Japanese/Simplified/Traditional Chinese, since earlier compound-string translations did not cover isolated nodes. Settings heading already translated. Added standalone-node regression. Cache settings-i18n19.
- Redeployment dpl_Gb7J6F2678FUejAuym4MQ2NjM54n READY, immutable https://busandrop-aa3e9nxgp-manoken2.vercel.app; alias busandrop.vercel.app. Targeted i18n/management tests 20 passed. Production My page/dictionary current-version and local byte-match verification passed, settings/logout/next-stop four-language entries verified.

## 2026-11-09 — Production app-only shell
- User reported studio/sidebar content visible on mobile production. Added scripts/production-shell.cjs to production build only: generated HTML gets viewport-fit=cover, app title, production marker and last-loaded shell CSS. Studio tools/inspector/labels/simulated status/home indicator hidden; responsive app fills 100dvh, max-width 480px on desktop, no fake phone frame. Native safe areas replace simulated status/bottom insets. Generated app forces color mode; local source studio unchanged.
- Seven shell/route tests and build passed. Deployment dpl_J6emRoqy7Hf4qoGrky8cZbRWGPfK READY, alias https://busandrop.vercel.app. Production my/login return 200 with shell marker; generated shell CSS byte-matches local build and app color mode verified. Browser/mobile screenshot verification unavailable. Existing unrelated test-suite failures remain documented above.

## 2026-11-09 — Preserve full 390×844 frame on devices
- User reported the deployed frame was undersized/incomplete on mobile/tablet. Latest instruction restores reference-frame fitting: generated production shell now has fixed logical 390×844 geometry and uniform contain scale based on visualViewport width/height. Centers the full frame, recalculates on viewport/orientation/pageshow changes, and keeps editing from shrinking the frame during keyboard resize. Local studio remains unchanged. Cache app-shell2.
- Eight shell/routing tests passed, including six phone/tablet/landscape bounds and aspect-ratio cases; build passed. Deployment dpl_2cpLSeBNVeAnJ1UueeWEmpSQtnmB READY, immutable https://busandrop-35gkm207y-manoken2.vercel.app, alias busandrop.vercel.app.
- Browser verification now available: at visible viewport 748×925, frame measured 427.43×925, ratio 390/844, x160.29/y0, tabbar bottom925, fits=true. Screenshot /tmp/busandrop-frame-fit-20261109.png. Device-specific iPad Chrome not directly tested; supplied screenshot used as reference.

## 2026-11-09 — Fluid width and iOS text colors
- User explicitly prioritized these UI corrections before analytics schema: remove 390×844 contain scaling, use 100% device width and available visualViewport height. Production container now has no fixed/max width or transform; original inner scrolling and bottom-nav safe-area positioning retained. Runtime responds to height/rotation changes without scaling font/control sizes.
- Explicit #191919 color, currentColor WebKit text fill and appearance reset added for My New plan/language/about controls to avoid native iOS blue. Root/mirror CSS and index synchronized; cache mobile-colors20 / fluid-shell3.
- Eighteen shell/route/management tests and build passed. Deployment dpl_6MUEVKoM5hfuqYFwr4PVwYX8kpDo READY, alias busandrop.vercel.app, immutable https://busandrop-ncmkuu6g8-manoken2.vercel.app. Browser measurement 748×925: phone748×925 atx0; navwidth748, bottom925; transformnone; three target labels rgb25,25,25. Screenshot /tmp/busandrop-fluid-width-20261109.png. Native iOS not directly tested.
- Prior task remains: Supabase analytics table design/creation. Analytics skill read; existing BUSANDROP_DB_구조.md reviewed. No analytics tables/migrations/tracking changes created yet. Dedicated auth project yinxfrdkxohyttmkuaxa chosen from current context. Supabase SQL editor in IAB tab16 requires user login; async question pending. User redirected priority to these UI changes before that work.

## 2026-11-09 — Visible viewport bounds and nonoverlapping vertical layout
- User reported height clipped and supplied iPad Chrome screenshot also showing rightmost content/My tab outside view. Runtime now uses visualViewport.width/height/offsetTop/offsetLeft (fallbacks retained), listens to visual resize AND scroll. Stage is placed at visible viewport offsets with matching bounds.
- Production phone uses flex column; viewport is relative/flexible with min-height0, detail actions and bottom navigation are nonshrinking siblings. Safe-area padding retained. This supersedes absolute viewport/nav height reservation and prevents overlapping content. Width100% retained, no reference scaling. Cache visible-shell4.
- 18 targeted tests + build passed, including visual viewport narrower than layout clientWidth and nonzero offsets. Deployed dpl_4rQWXbSfC3zBNFVHVuyEvY3LadjC READY, immutable https://busandrop-e4fepzhni-manoken2.vercel.app, alias busandrop.vercel.app.
- Browser verified at748×925: frame748×925, navbottom925, all5tabswithinframe=true, contentbottom861/navtop861 with no overlap. Screenshot /tmp/busandrop-visible-height-20261109.png. Exact iPad Chrome environment remains unverified; report limitation rather than claiming device-specific reproduction. Supabase analytics creation still pending user admin login and remains unimplemented.

## 2026-11-09 — Mobile web presentation on every device
- User clarified desktop/tablet must also render as mobile web, rather than edge-to-edge wide layouts. Production phone keeps width100% below430px, max-width430px and margin0auto on larger screens. Visual viewport height/offset tracking and flex/nonoverlapping nav retained; no 390×844 scale. Cache mobile-web-shell5.
- Eight shell/routing tests and build passed. Deployed dpl_8beBSRdj6XqPXzXTvvMopmpG8bcG READY, immutable https://busandrop-h4oggb69d-manoken2.vercel.app, alias busandrop.vercel.app. Browser748×925 measured phone430×925 atx159 centered=true, nav430/bottom925, no content overlap. Screenshot /tmp/busandrop-mobile-web-20261109.png. Native iPad/Android verification pending user feedback.

## 2026-11-09 — iPad root cause remains unconfirmed; opt-in viewport diagnostics
- User says iPad height still mismatches. Do not claim fixed or assert a browser bug without actual device values. Added ?layout_debug=1 local-only overlay reporting build marker, inner/client/visual dimensions, viewport scale/offset, app bounds and nav bottom vs visible bottom. No network telemetry or persistent logging; normal URL has no overlay and retains prior mobile-width layout.
- Generated runtime source syntax corrected and checked before deploy. Three shell tests + build passed, including debug rendering/no transmission. Deployment dpl_DRvnJtKFnWVaDZX26EA8UbFcpgFi READY, alias busandrop.vercel.app, immutable https://busandrop-90arefoe8-manoken2.vercel.app. Cache viewport-check6.
- Browser debug URL verified at1280×720: visual1280×720, app430×720, navbottom720. Screenshot /tmp/busandrop-height-diagnostic-20261109.png. Need user iPad diagnostic screenshot/values to identify the actual mismatch. Supabase analytics schema remains pending and no tables created.
