# BUSAN DROP — 디자이너 작업 시작

2026-11-12 웹·앱 화면 디자인 인수인계본입니다. 현재 운영: https://busandrop.vercel.app/busandrop/home

웹과 앱이 공유하는 화면·자산·기능 로직, 연결에 필요한 Supabase 문서와 테스트를 전달합니다. iOS·Android 패키징 없이 브라우저에서 앱 화면을 수정하고 확인할 수 있습니다. 먼저 [HANDOFF.md](HANDOFF.md)를 읽고 디자인 수정 위치와 남은 이슈를 확인하세요.

## 실행

Node.js **24.x**와 Git이 필요합니다. 저장소 최상위에서 실행합니다.

```sh
git clone https://github.com/choiyeongseo-art/skp_team1.git
cd skp_team1
git switch -c design/polish
npm ci
npm run dev
```

- 개발 스튜디오: http://127.0.0.1:4187/busandrop/home
- 운영 화면과 같은 레이아웃 확인: `npm run preview` → http://127.0.0.1:4188/busandrop/home
- `preview`는 빌드 후 생성된 앱 전용 화면을 제공합니다. 사이드바 없이 좁은 화면은 너비 100%, 넓은 화면은 최대 430px 중앙 열입니다.
- 두 서버는 터미널을 별도로 열어 함께 실행할 수 있습니다. **Python 정적 서버나 index.html 직접 열기는 사용하지 마세요.** URL 라우팅과 API가 필요합니다.

지도 설정은 기존 운영 사이트의 공개 설정에서 읽습니다. 네트워크가 필요합니다. 키 없이도 게스트 화면 디자인을 시작할 수 있지만, 실제 로그인·계정 동기화·관광/맛집 API를 쓰려면 `.env.example`을 참고하여 `.env.local`을 별도로 설정해야 합니다. 인증 설정은 [docs/AUTH-SETUP.md](docs/AUTH-SETUP.md)를 참고하세요. 키를 Git에 넣지 마세요.

## 수정 및 검증

```sh
npm test
npm run build
npm run verify:handoff
```

`npm test`는 기능 검증입니다. `verify:handoff`는 **이번 인수인계 기준 파일의 SHA-256 비교**이므로 디자인 수정 후 변경 파일을 보고하는 것이 정상입니다. 수정한 파일을 숨기려고 기준 manifest를 자동 재생성하지 마세요.

앱 원본은 `busan-drop/`입니다. `public/busandrop/`은 빌드 산출물이므로 수정·커밋하지 않습니다. 디자인을 수정한 뒤 `preview`를 재시작하면 새 원본으로 다시 빌드합니다.

디자이너는 변경 사항을 커밋·푸시해 전달합니다. 현재 배포는 Vercel CLI 수동 방식입니다. 이 저장소 푸시만으로 운영이 갱신된다고 가정하지 마세요. 배포 담당자는 변경을 검토한 뒤 기존 Vercel 프로젝트에 배포합니다.

```sh
npm test
npm run build
vercel link --yes --project busandrop --scope manoken2
vercel deploy --prod --scope manoken2
```

Vercel 접근 권한과 운영 환경 변수는 담당자가 별도로 관리합니다. 이 저장소에는 배포 토큰·서버 키·사용자 저장 데이터가 포함되지 않습니다.

## 문서

- [HANDOFF.md](HANDOFF.md): 현재 기능, 수정 파일 지도, 디자인 마무리 범위, 알려진 이슈
- [docs/AUTH-SETUP.md](docs/AUTH-SETUP.md): Google·Apple OAuth와 로컬 콜백 설정
- [supabase/ACCOUNT_PASSWORD_AUTH.md](supabase/ACCOUNT_PASSWORD_AUTH.md): 아이디·비밀번호 가입 및 로그인 설정
- [supabase/ACCOUNT_PERSISTENCE.md](supabase/ACCOUNT_PERSISTENCE.md): 계정별 행사·플랜·언어 저장
- [supabase/PRODUCT_ANALYTICS.md](supabase/PRODUCT_ANALYTICS.md): 지표 정의·테이블·집계 SQL
- [supabase/migrations/](supabase/migrations/): 신규 환경에 적용할 DB SQL
- [docs/archive/HANDOFF_HISTORY_through_20261109.md](docs/archive/HANDOFF_HISTORY_through_20261109.md): 이전 변경 이력. 현재 동작은 최신 README/HANDOFF가 우선합니다.
